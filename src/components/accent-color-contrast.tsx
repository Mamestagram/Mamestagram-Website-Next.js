"use client";

import { useEffect } from "react";
import { compositeColor, getReadableTextOverride, parseComputedColor, type RgbaColor } from "@/lib/color-contrast";

const accentScope = "[data-accent-color], [data-custom-color=\"true\"]";
const colorStyleProperties = [
	"color", "background", "background-color", "background-image",
	"--user-hue", "--accent-saturation-scale", "--accent-lightness-shift",
	"--profile-ui-color-hue", "--profile-ui-color-saturation", "--profile-ui-color-lightness",
	"--profile-ui-preview-color-hue", "--profile-ui-preview-color-saturation", "--profile-ui-preview-color-lightness",
] as const;

type TextRules = { color: CSSStyleRule; placeholder?: CSSStyleRule };
export default function AccentColorContrast() {
	useEffect(() => {
		// CSSOM rules leave React-owned HTML untouched, including delayed hydration boundaries.
		const root = document.documentElement;
		const colors = new CSSStyleSheet();
		document.adoptedStyleSheets = [...document.adoptedStyleSheets, colors];
		const rules = new Map<HTMLElement, TextRules>();
		const pendingScopes = new Set<HTMLElement>();
		let fullUpdate = true;
		let structureChanged = false;
		let frame = 0;
		let stopped = false;
		const oldStyle = document.createElement("span").style;
		const cancelTextTransition = (element: HTMLElement) => {
			for (const animation of element.getAnimations())
				if (animation instanceof CSSTransition && animation.transitionProperty === "color") animation.cancel();
		};
		const observe = () => observer.observe(root, {
			subtree: true, childList: true, attributes: true, attributeOldValue: true,
			attributeFilter: ["style", "class", "hidden", "data-theme", "data-profile-theme", "data-profile-ui-theme", "data-accent-color", "data-custom-color"],
		});
		const update = () => {
			frame = 0;
			if (stopped) return;
			const all = fullUpdate;
			const scopes = all ? [document.body] : [...pendingScopes].filter((scope, index, entries) =>
				scope.isConnected && !entries.some((other, otherIndex) => index !== otherIndex && other.contains(scope)));
			fullUpdate = false;
			pendingScopes.clear();
			observer.disconnect();
			if (!root.matches(accentScope) && !root.querySelector(accentScope)) {
				colors.replaceSync("");
				rules.clear();
				observe();
				return;
			}

			if (structureChanged && !all) for (const [element, entry] of rules) if (!element.isConnected) {
				entry.color.style.removeProperty("color");
				entry.placeholder?.style.removeProperty("color");
				entry.placeholder?.style.removeProperty("opacity");
				rules.delete(element);
			}
			structureChanged = false;
			const candidates = new Set(scopes.flatMap((scope) => [scope, ...scope.querySelectorAll<HTMLElement>("*")]));
			const affected = all ? [...rules] : [...candidates].flatMap((element): [HTMLElement, TextRules][] => {
				const entry = rules.get(element);
				return entry ? [[element, entry]] : [];
			});
			if (all) {
				colors.replaceSync("");
				rules.clear();
			} else {
				for (const [, entry] of affected) {
					entry.color.style.removeProperty("color");
					entry.placeholder?.style.removeProperty("color");
					entry.placeholder?.style.removeProperty("opacity");
				}
			}
			for (const [element] of affected) if (element.isConnected) cancelTextTransition(element);
			const styles = new Map<HTMLElement, CSSStyleDeclaration>();
			const getStyle = (element: HTMLElement) => {
				let style = styles.get(element);
				if (!style) { style = getComputedStyle(element); styles.set(element, style); }
				return style;
			};
			const backgrounds = new Map<HTMLElement, readonly RgbaColor[]>();
			const compositeSurface = (style: CSSStyleDeclaration, parents: readonly RgbaColor[], opacity = 1): readonly RgbaColor[] => {
				const background = parseComputedColor(style.backgroundColor) ?? [0, 0, 0, 0];
				const stops = (style.backgroundImage.match(/(?:rgba?|color)\([^)]+\)/g) ?? [])
					.map(parseComputedColor).filter((color): color is RgbaColor => color !== null);
				const layers = stops.length > 0 ? stops.map((stop) => compositeColor(stop, background)) : [background];
				return layers.flatMap((layer) => parents.map((parent) =>
					compositeColor([layer[0], layer[1], layer[2], layer[3] * opacity], parent))).slice(0, 12);
			};
			const getBackgrounds = (element: HTMLElement | null): readonly RgbaColor[] => {
				if (!element) return [[16, 16, 18, 1]];
				const cached = backgrounds.get(element);
				if (cached) return cached;
				const values = compositeSurface(getStyle(element), getBackgrounds(element.parentElement));
				backgrounds.set(element, values);
				return values;
			};
			const plans = new Map<HTMLElement, string>();
			const placeholderPlans = new Map<HTMLElement, string>();
			const contrastCache = new Map<string, string | null>();
			// Finish reads before updating rules, so each text node does not force another page-wide style calculation.
			for (const element of candidates) {
				if (!(element instanceof HTMLElement) || element.closest("svg, script, style, [hidden]")) continue;
				if (!element.closest(accentScope)) continue;
				const input = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
				if (!input && !Array.from(element.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())) continue;
				const style = getStyle(element);
				if (style.display === "none" || style.visibility === "hidden" || style.backgroundClip === "text") continue;
				const foreground = parseComputedColor(style.color);
				if (!foreground) continue;
				const background = getBackgrounds(element);
				if (input && element.getAttribute("placeholder")) {
					const placeholderStyle = getComputedStyle(element, "::placeholder");
					const color = parseComputedColor(placeholderStyle.color);
					if (color) {
						const foreground: RgbaColor = [color[0], color[1], color[2], color[3] * Number.parseFloat(placeholderStyle.opacity)];
						const override = getReadableTextOverride(foreground, background);
						if (override) placeholderPlans.set(element, override);
					}
				}
				const key = `${foreground.join(",")}|${background.map((color) => color.join(",")).join(";")}`;
				if (!contrastCache.has(key)) contrastCache.set(key, getReadableTextOverride(foreground, background));
				const override = contrastCache.get(key);
				if (override) plans.set(element, override);
				else {
					// Preserve readable descendants when a corrected ancestor changes their inherited color.
					for (let parent = element.parentElement; parent; parent = parent.parentElement)
						if (plans.has(parent)) { plans.set(element, style.color); break; }
				}
			}
			const selectors = new WeakMap<HTMLElement, string>();
			const getSelector = (element: HTMLElement): string => {
				if (element === document.body) return ":is(#accent-contrast-override, body)";
				const cached = selectors.get(element);
				if (cached) return cached;
				const parent = element.parentElement;
				if (!parent) return "html";
				const selector = `${getSelector(parent)} > :nth-child(${Array.from(parent.children).indexOf(element) + 1})`;
				selectors.set(element, selector);
				return selector;
			};
			const addRule = (selector: string) => {
				const index = colors.insertRule(`${selector} {}`, colors.cssRules.length);
				return colors.cssRules[index] as CSSStyleRule;
			};
			for (const element of new Set([...plans.keys(), ...placeholderPlans.keys()])) {
				let entry = rules.get(element);
				if (!entry) {
					const selector = getSelector(element);
					entry = { color: addRule(selector) };
					if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) entry.placeholder = addRule(`${selector}::placeholder`);
					rules.set(element, entry);
				}
				const selector = getSelector(element);
				if (entry.color.selectorText !== selector) entry.color.selectorText = selector;
				if (entry.placeholder && entry.placeholder.selectorText !== `${selector}::placeholder`) entry.placeholder.selectorText = `${selector}::placeholder`;
				const override = plans.get(element);
				if (override) entry.color.style.setProperty("color", override, "important");
				const placeholderOverride = placeholderPlans.get(element);
				if (placeholderOverride && entry.placeholder) {
					entry.placeholder.style.setProperty("color", placeholderOverride, "important");
					entry.placeholder.style.setProperty("opacity", "1", "important");
				}
			}
			for (const element of plans.keys()) cancelTextTransition(element);
			observe();
		};
		const schedule = (scope?: HTMLElement) => {
			if (!scope || scope === root || scope === document.body) { fullUpdate = true; pendingScopes.clear(); }
			else if (!fullUpdate) pendingScopes.add(scope);
			if (!frame && !stopped) frame = requestAnimationFrame(update);
		};
		const observer = new MutationObserver((records) => {
			for (const record of records) {
				if (record.type === "childList") {
					// Counts and timers replace text nodes without changing their colors.
					if (![...record.addedNodes, ...record.removedNodes].some((node) => node instanceof Element)) continue;
					structureChanged = true;
					const parent = record.target;
					if (!(parent instanceof HTMLElement)) { schedule(); break; }
					if (parent.closest("head")) { schedule(); break; }
					if (parent === document.body && record.nextSibling === null) {
						for (const node of record.addedNodes) if (node instanceof HTMLElement) schedule(node);
						if (!frame && !stopped) frame = requestAnimationFrame(update);
					} else schedule(parent);
					continue;
				}
				const target = record.target instanceof HTMLElement ? record.target : record.target.parentElement;
				if (!target) continue;
				if (record.attributeName === "style") {
					oldStyle.cssText = record.oldValue ?? "";
					if (!colorStyleProperties.some((property) => oldStyle.getPropertyValue(property) !== target.style.getPropertyValue(property))) continue;
				}
				schedule(target.closest<HTMLElement>("tr, li, article") ?? target);
			}
		});
		// No hover listeners or per-frame scans: update only when the palette or DOM structure changes.
		const handleStylesheet = (event: Event) => {
			if (event.target instanceof HTMLLinkElement && event.target.rel === "stylesheet") schedule();
		};
		update();
		document.addEventListener("load", handleStylesheet, true);
		return () => {
			stopped = true;
			cancelAnimationFrame(frame);
			document.removeEventListener("load", handleStylesheet, true);
			observer.disconnect();
			colors.replaceSync("");
			for (const element of rules.keys()) if (element.isConnected) cancelTextTransition(element);
			document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== colors);
		};
	}, []);
	return null;
}
