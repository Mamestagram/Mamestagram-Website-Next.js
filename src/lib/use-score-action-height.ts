"use client";

import { useLayoutEffect, type RefObject } from "react";
import { getProfileUiScoreElementHeight } from "@/lib/profile-ui-score-layout";
import styles from "@s/profile.module.css";

// Action panels animate independently of the saved card height. Measure only the
// inline preview so opening the Show all dialog cannot affect the profile card.
export const useScoreActionHeight = (listRef: RefObject<HTMLElement | null>) => {
	useLayoutEffect(() => {
		const list = listRef.current;
		const box = list?.parentElement?.parentElement;
		const content = box?.parentElement;
		if (!list || !box || !content?.hasAttribute("data-fixed-height")) return;
		let expandedHeight = 0;
		let baseHeight = getProfileUiScoreElementHeight(box);
		let frame: number | null = null;
		const observed = new Set<Element>();
		const update = () => {
			const panels = Array.from(list.querySelectorAll<HTMLElement>(`.${styles.score_action_reveal}`));
			const height = panels.reduce((sum, panel) => sum + getProfileUiScoreElementHeight(panel), 0);
			if (expandedHeight === 0) baseHeight = getProfileUiScoreElementHeight(box);
			expandedHeight = height;
			content.style.setProperty("--profile-ui-score-actions-base-height", `${baseHeight}px`);
			content.style.setProperty("--profile-ui-score-actions-height", `${height}px`);
			content.dataset.scoreActionsExpanded = String(height > 0);
		};
		const schedule = () => {
			if (frame !== null) return;
			frame = requestAnimationFrame(() => { frame = null; update(); });
		};
		const observer = new ResizeObserver(schedule);
		const observe = () => {
			const elements = new Set<Element>([box, ...list.querySelectorAll(`.${styles.score_action_reveal}`)]);
			for (const element of observed) if (!elements.has(element)) { observer.unobserve(element); observed.delete(element); }
			for (const element of elements) if (!observed.has(element)) { observer.observe(element); observed.add(element); }
			update();
		};
		const mutations = new MutationObserver(observe);
		mutations.observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-expanded"] });
		observe();
		return () => {
			if (frame !== null) cancelAnimationFrame(frame);
			observer.disconnect();
			mutations.disconnect();
			content.style.removeProperty("--profile-ui-score-actions-base-height");
			content.style.removeProperty("--profile-ui-score-actions-height");
			delete content.dataset.scoreActionsExpanded;
		};
	}, [listRef]);
};
