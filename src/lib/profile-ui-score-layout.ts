import type { CSSProperties } from "react";
import { PROFILE_UI_SCORE_LAYOUT, type ProfileUiScoreMetrics } from "@/lib/profile-ui";

export const getProfileUiScoreLayoutStyle = (scale = 1): CSSProperties =>
	Object.fromEntries([...Object.entries(PROFILE_UI_SCORE_LAYOUT)
		.map(([name, value]) => [
			`--profile-ui-score-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
			name === "defaultVisibleCount" ? value : `${value * scale}px`,
		]), ["--profile-ui-score-default-padding", `${PROFILE_UI_SCORE_LAYOUT.padding * scale}px`]]);

// CSS row sizes use layout pixels; bounding rectangles also include visual zoom
// and transforms, which can incorrectly reduce a five-row card to four rows.
export const getProfileUiScoreElementHeight = (element: HTMLElement, style = getComputedStyle(element)): number => {
	const height = Number.parseFloat(style.height);
	if (!Number.isFinite(height)) return element.offsetHeight;
	if (style.boxSizing === "border-box") return height;
	return height + [style.paddingTop, style.paddingBottom, style.borderTopWidth, style.borderBottomWidth]
		.reduce((sum, value) => sum + (Number.parseFloat(value) || 0), 0);
};

// Measure the same geometry in the live profile and its vertically scaled preview.
export const measureProfileUiScoreLayout = (
	card: HTMLElement,
	heading: HTMLElement,
	list: HTMLElement,
	scale = 1,
): ProfileUiScoreMetrics => {
	const cardStyle = getComputedStyle(card);
	const headingStyle = getComputedStyle(heading);
	const listStyle = getComputedStyle(list);
	const pixels = (value: string) => (Number.parseFloat(value) || 0) / scale;
	return {
		borderHeight: cardStyle.getPropertyValue("--profile-ui-score-border-height")
			? pixels(cardStyle.getPropertyValue("--profile-ui-score-border-height"))
			: pixels(cardStyle.borderTopWidth) + pixels(cardStyle.borderBottomWidth),
		paddingTop: pixels(cardStyle.paddingTop),
		paddingBottom: pixels(cardStyle.paddingBottom),
		headingHeight: getProfileUiScoreElementHeight(heading, headingStyle) / scale,
		headingGap: pixels(headingStyle.marginTop) + pixels(headingStyle.marginBottom),
		rowHeight: pixels(listStyle.getPropertyValue("--profile-ui-score-row-height")),
		rowGap: pixels(listStyle.rowGap),
		footerHeight: pixels(cardStyle.getPropertyValue("--profile-ui-score-footer-height")),
		footerGap: pixels(cardStyle.getPropertyValue("--profile-ui-score-footer-gap")),
	};
};
