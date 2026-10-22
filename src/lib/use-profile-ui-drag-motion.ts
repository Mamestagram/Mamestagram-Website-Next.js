"use client";

import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";

const CARD_SELECTOR = "[data-preview-content]:not([data-move-source='true']), [data-content-move-preview]";
type CardBounds = { left: number; top: number; width: number };

export const useProfileUiDragMotion = (viewportRef: RefObject<HTMLElement | null>) => {
	const snapshots = useRef<Map<HTMLElement, CardBounds> | null>(null);
	const animations = useRef(new Map<HTMLElement, Animation>());
	const cancel = useCallback(() => {
		for (const animation of animations.current.values()) animation.cancel();
		animations.current.clear();
		snapshots.current = null;
	}, []);
	const capture = useCallback(() => {
		const viewport = viewportRef.current;
		if (!viewport || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return cancel();
		// Read the current visual position before interrupting a previous move.
		// Scroll offsets keep auto-scrolling out of the animation's movement.
		const bounds = new Map(Array.from(viewport.querySelectorAll<HTMLElement>(CARD_SELECTOR)).map((card) => {
			const rect = card.getBoundingClientRect();
			return [card, { left: rect.left + viewport.scrollLeft, top: rect.top + viewport.scrollTop, width: rect.width }] as const;
		}));
		cancel();
		snapshots.current = bounds;
	}, [cancel, viewportRef]);

	useLayoutEffect(() => {
		const viewport = viewportRef.current;
		const previous = snapshots.current;
		snapshots.current = null;
		if (!viewport || !previous) return;
		for (const card of viewport.querySelectorAll<HTMLElement>(CARD_SELECTOR)) {
			const before = previous.get(card);
			if (!before) continue;
			const rect = card.getBoundingClientRect();
			if (rect.width <= 0 || before.width <= 0) continue;
			const x = before.left - rect.left - viewport.scrollLeft;
			const y = before.top - rect.top - viewport.scrollTop;
			const scale = before.width / rect.width;
			if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5 && Math.abs(before.width - rect.width) < 0.5) continue;
			// Scale only horizontally so measured content heights remain accurate.
			const animation = card.animate([
				{ transform: `translate(${x}px, ${y}px) scaleX(${scale})`, transformOrigin: "top left" },
				{ transform: "none", transformOrigin: "top left" },
			], { duration: 180, easing: "cubic-bezier(0.2, 0, 0, 1)" });
			animations.current.set(card, animation);
			animation.addEventListener("finish", () => {
				if (animations.current.get(card) === animation) animations.current.delete(card);
			}, { once: true });
		}
	});

	useLayoutEffect(() => {
		const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
		const change = () => { if (preference.matches) cancel(); };
		preference.addEventListener("change", change);
		return () => { preference.removeEventListener("change", change); cancel(); };
	}, [cancel]);
	return { capture, cancel };
};
