import { resolveProfileUiAutoWidths } from "@/lib/profile-ui-width";
import { isWebTheme, type WebTheme } from "@/lib/theme";

export const profileUiContentValues = [
	"info",
	"stats",
	"me",
	"bestpp",
	"first_place",
	"most_played",
	"recent_played",
	"achievements",
	"custom_achievements",
] as const;

export type ProfileUiContent = (typeof profileUiContentValues)[number];
export const PROFILE_UI_MAX_CONTENTS = 800;
export const PROFILE_UI_MAX_CONTENTS_PER_TYPE = 2;
export const PROFILE_UI_MIN_HEIGHT = 80;
export const PROFILE_UI_SCORE_LAYOUT = {
	padding: 32,
	compactPadding: 18,
	headingHeight: 30,
	headingGap: 14,
	rowHeight: 58,
	rowGap: 6,
	footerHeight: 44,
	footerGap: 14,
	defaultVisibleCount: 5,
} as const;

export const getProfileUiScoreHeightForRows = (rows: number) => {
	const layout = PROFILE_UI_SCORE_LAYOUT;
	// Include the glass theme's two borders and the footer below the visible rows.
	return 2 + layout.padding + layout.headingHeight + layout.headingGap +
		rows * layout.rowHeight + Math.max(0, rows - 1) * layout.rowGap +
		layout.footerGap + layout.footerHeight;
};

export const PROFILE_UI_SCORE_MIN_HEIGHT = getProfileUiScoreHeightForRows(1);
export const PROFILE_UI_SCORE_MAX_HEIGHT = getProfileUiScoreHeightForRows(100);

export type ProfileUiScoreMetrics = {
	borderHeight: number;
	paddingTop: number;
	paddingBottom: number;
	headingHeight: number;
	headingGap: number;
	rowHeight: number;
	rowGap: number;
	footerHeight: number;
	footerGap: number;
};

export type ProfileUiItem = {
	content: ProfileUiContent;
	order: number;
	width: number;
	autoWidth?: boolean;
	height: number;
	edgeRadius: number;
	boxOpacity: number;
	color: string | null;
	theme?: WebTheme;
	customized?: boolean;
};

export const canAddProfileUiContent = (contents: readonly ProfileUiItem[], content: ProfileUiContent): boolean =>
	contents.length < PROFILE_UI_MAX_CONTENTS && contents.filter((item) => item.content === content).length < PROFILE_UI_MAX_CONTENTS_PER_TYPE;

export const hasValidProfileUiContentCounts = (contents: readonly ProfileUiItem[]): boolean => {
	const counts = new Map<ProfileUiContent, number>();
	for (const item of contents) {
		const count = (counts.get(item.content) ?? 0) + 1;
		if (count > PROFILE_UI_MAX_CONTENTS_PER_TYPE) return false;
		counts.set(item.content, count);
	}
	return true;
};

export const profileUiContentLabels: Record<ProfileUiContent, string> = {
	info: "Profile info",
	stats: "Statistics",
	me: "Me!",
	bestpp: "Best performance",
	first_place: "First place ranks",
	most_played: "Most played maps",
	recent_played: "Recent played maps",
	achievements: "Achievements",
	custom_achievements: "Featured achievements",
};

export const profileUiHeightLimits = {
	// Keep the existing maximum until the Me! limit has been decided.
	me: { min: 500, max: 2400 },
	bestpp: { min: PROFILE_UI_SCORE_MIN_HEIGHT, max: PROFILE_UI_SCORE_MAX_HEIGHT },
	first_place: { min: PROFILE_UI_SCORE_MIN_HEIGHT, max: PROFILE_UI_SCORE_MAX_HEIGHT },
	most_played: { min: PROFILE_UI_SCORE_MIN_HEIGHT, max: PROFILE_UI_SCORE_MAX_HEIGHT },
	recent_played: { min: PROFILE_UI_SCORE_MIN_HEIGHT, max: PROFILE_UI_SCORE_MAX_HEIGHT },
} as const;

export const isProfileUiRowHeight = (content: ProfileUiContent) =>
	content === "info" || content === "stats" || content === "achievements";

export const isProfileUiAutoHeight = (content: ProfileUiItem) =>
	// Featured medals always keep their intrinsic height instead of stretching to a peer.
	content.content !== "custom_achievements" && (isProfileUiRowHeight(content.content) || content.height === -1);

export const getProfileUiContentHeightLimits = (content: ProfileUiContent) =>
	content in profileUiHeightLimits
		? profileUiHeightLimits[content as keyof typeof profileUiHeightLimits]
		: null;

export const getProfileUiContentMinHeight = (content: ProfileUiContent) =>
	getProfileUiContentHeightLimits(content)?.min ?? PROFILE_UI_MIN_HEIGHT;

export const getProfileUiRowHeightMatches = (contents: ProfileUiItem[]): boolean[] => {
	const matches = contents.map(() => false);
	if (hasDefaultProfileUiArrangement(contents)) return matches;
	let row: number[] = [];
	let used = 0;
	const finishRow = () => {
		if (row.length > 1)
			for (const index of row) matches[index] = isProfileUiAutoHeight(contents[index]);
		row = [];
		used = 0;
	};
	for (const [index, content] of contents.entries()) {
		const span = Math.round(content.width * 100);
		if (used + span > 100) finishRow();
		row.push(index);
		used += span;
		if (used === 100) finishRow();
	}
	finishRow();
	return matches;
};

export const getProfileUiScoreVisibleCount = (
	height: number,
	count = Number.POSITIVE_INFINITY,
	metrics: Partial<ProfileUiScoreMetrics> = {},
) => {
	if (height === -1) return Math.min(count, PROFILE_UI_SCORE_LAYOUT.defaultVisibleCount);
	const layout: ProfileUiScoreMetrics = {
		...PROFILE_UI_SCORE_LAYOUT,
		borderHeight: 0,
		paddingTop: PROFILE_UI_SCORE_LAYOUT.padding,
		paddingBottom: PROFILE_UI_SCORE_LAYOUT.padding,
		...metrics,
	};
	const availableHeight = height - layout.borderHeight - layout.paddingTop - layout.paddingBottom -
		layout.headingHeight - layout.headingGap;
	const capacity = (height: number) => Math.max(
		1,
		// Scaled half-size previews can round a layout measurement just below
		// an exact row boundary. Allow less than a pixel of rounding, not a row.
		Math.floor((height + layout.rowGap + 0.5) / (layout.rowHeight + layout.rowGap)),
	);
	const withoutFooter = capacity(availableHeight);
	// The footer extends through the card's bottom padding.
	const footerSpace = layout.footerHeight + layout.footerGap - layout.paddingBottom;
	return Math.min(count, count <= withoutFooter
		? withoutFooter
		: capacity(availableHeight - footerSpace));
};

export const PROFILE_UI_SCORE_AUTO_HEIGHT =
	PROFILE_UI_SCORE_LAYOUT.padding + PROFILE_UI_SCORE_LAYOUT.headingHeight +
	PROFILE_UI_SCORE_LAYOUT.headingGap +
	PROFILE_UI_SCORE_LAYOUT.defaultVisibleCount * PROFILE_UI_SCORE_LAYOUT.rowHeight +
	(PROFILE_UI_SCORE_LAYOUT.defaultVisibleCount - 1) * PROFILE_UI_SCORE_LAYOUT.rowGap +
	PROFILE_UI_SCORE_LAYOUT.footerGap + PROFILE_UI_SCORE_LAYOUT.footerHeight;

export const createProfileUiContent = (
	content: ProfileUiContent,
	order: number,
	width = 1,
): ProfileUiItem => ({
	content,
	order,
	width,
	...(content === "stats" || content === "me" || content === "achievements" || content === "custom_achievements" ? { autoWidth: true } : {}),
	height: isProfileUiRowHeight(content) || content === "me" || content === "custom_achievements"
		? -1 : getProfileUiScoreHeightForRows(PROFILE_UI_SCORE_LAYOUT.defaultVisibleCount),
	edgeRadius: 20,
	boxOpacity: 0.9,
	color: null,
	customized: false,
});

export const createProfileUiToolboxContent = (content: ProfileUiContent, order: number): ProfileUiItem => ({
	...createProfileUiContent(content, order),
	autoWidth: true,
	height: -1,
});

export const getDefaultProfileUi = (): ProfileUiItem[] => [
	createProfileUiContent("info", 1, 0.59),
	createProfileUiContent("stats", 2, 0.41),
	createProfileUiContent("me", 3),
	createProfileUiContent("bestpp", 4, 0.64),
	createProfileUiContent("first_place", 5, 0.64),
	createProfileUiContent("most_played", 6, 0.64),
	createProfileUiContent("recent_played", 7, 0.64),
	createProfileUiContent("achievements", 8, 0.36),
];

export const resetProfileUiContentSettings = (content: ProfileUiItem): ProfileUiItem => ({
	...(getDefaultProfileUi().find((item) => item.content === content.content) ?? createProfileUiContent(content.content, content.order)),
	order: content.order,
	customized: content.customized,
});

export const hasDefaultProfileUiContentSettings = (content: ProfileUiItem): boolean => {
	const defaults = resetProfileUiContentSettings(content);
	return Boolean(content.autoWidth) === Boolean(defaults.autoWidth) && (content.autoWidth || content.width === defaults.width) && content.height === defaults.height &&
		content.edgeRadius === defaults.edgeRadius && content.boxOpacity === defaults.boxOpacity && content.color === defaults.color && content.theme === defaults.theme;
};

// Keep the standard two-column arrangement when only appearance or height is
// edited. Moving, adding, removing, or changing a card's width uses the free grid.
export const hasDefaultProfileUiArrangement = (contents: ProfileUiItem[]) => {
	const defaults = getDefaultProfileUi();
	// The standard hero ratio applies while at least one hero width is manual.
	// Enabling Auto for both uses the same equal-width grid as other Auto rows.
	if (contents[0]?.autoWidth && contents[1]?.autoWidth) return false;
	return contents.length === defaults.length && contents.every((content, index) =>
		content.content === defaults[index].content && content.width === defaults[index].width,
	);
};

export const normalizeProfileUi = (contents: ProfileUiItem[]): ProfileUiItem[] => {
	const normalized = contents.map((content, index) => {
		const limits = getProfileUiContentHeightLimits(content.content);
		const { autoWidth, theme, ...settings } = content;
		return {
			...settings,
			...(autoWidth ? { autoWidth: true } : {}),
			...(isWebTheme(theme) ? { theme } : {}),
			order: index + 1,
			height: !limits || content.height === -1 ? -1 : Math.min(limits.max, Math.max(limits.min, content.height)),
		};
	});
	return resolveProfileUiAutoWidths(normalized, hasDefaultProfileUiArrangement(normalized));
};

export const isDefaultProfileUi = (contents: ProfileUiItem[]) => {
	const defaults = getDefaultProfileUi();
	return contents.length === defaults.length && contents.every((content, index) => {
		const item = defaults[index];
		return content.content === item.content && content.order === item.order &&
			content.width === item.width && Boolean(content.autoWidth) === Boolean(item.autoWidth) && content.height === item.height &&
			content.edgeRadius === item.edgeRadius && content.boxOpacity === item.boxOpacity &&
			content.color === item.color && content.theme === item.theme;
	});
};

// Compare saved settings, independently of property order and render metadata.
export const areProfileUiContentsEqual = (left: ProfileUiItem[], right: ProfileUiItem[]): boolean =>
	left.length === right.length && left.every((content, index) => {
		const other = right[index];
		return content.content === other.content && content.order === other.order &&
			content.width === other.width && Boolean(content.autoWidth) === Boolean(other.autoWidth) &&
			content.height === other.height && content.edgeRadius === other.edgeRadius &&
			content.boxOpacity === other.boxOpacity && content.color === other.color && content.theme === other.theme;
	});

export const isProfileUiContent = (
	value: unknown,
): value is ProfileUiContent =>
	typeof value === "string" &&
	profileUiContentValues.some((content) => content === value);

const isFiniteNumber = (value: unknown): value is number =>
	typeof value === "number" && Number.isFinite(value);

const isValidWidth = (value: unknown): value is number =>
	isFiniteNumber(value) &&
	value >= 0.01 &&
	value <= 1 &&
	Math.abs(value * 100 - Math.round(value * 100)) < Number.EPSILON * 100;

const isValidHeight = (
	value: unknown,
	minimum = PROFILE_UI_MIN_HEIGHT,
	maximum = 2400,
): value is number =>
	isFiniteNumber(value) &&
	Number.isInteger(value) &&
	(value === -1 || (value >= minimum && value <= maximum));

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

export const parseProfileUiContents = (
	value: unknown,
	normalizeHeights = false,
): ProfileUiItem[] | null => {
	if (!Array.isArray(value) || value.length > PROFILE_UI_MAX_CONTENTS) return null;
	const contents: ProfileUiItem[] = [];
	for (const [index, rawContent] of value.entries()) {
		if (!isRecord(rawContent)) return null;
		if (!isProfileUiContent(rawContent.content)) return null;
		const contentName = rawContent.content;
		const heightLimits = getProfileUiContentHeightLimits(contentName);
		if (
			!isValidWidth(rawContent.width) ||
			(rawContent.autoWidth !== undefined && typeof rawContent.autoWidth !== "boolean") ||
			(rawContent.theme !== undefined && rawContent.theme !== null && !isWebTheme(rawContent.theme)) ||
			!isFiniteNumber(rawContent.height) || !Number.isInteger(rawContent.height) ||
			(heightLimits !== null && !normalizeHeights && !isValidHeight(rawContent.height, heightLimits.min, heightLimits.max)) ||
			!isFiniteNumber(rawContent.edgeRadius) ||
			!Number.isInteger(rawContent.edgeRadius) ||
			rawContent.edgeRadius < 0 ||
			rawContent.edgeRadius > 80 ||
			!isFiniteNumber(rawContent.boxOpacity) ||
			rawContent.boxOpacity < 0 ||
			rawContent.boxOpacity > 1 ||
			(rawContent.color !== null &&
				(typeof rawContent.color !== "string" ||
					!/^[0-9a-f]{6}$/i.test(rawContent.color)))
		)
			return null;

		contents.push({
			content: contentName,
			order: index + 1,
			width: rawContent.width,
			...(rawContent.autoWidth === true ? { autoWidth: true } : {}),
			...(isWebTheme(rawContent.theme) ? { theme: rawContent.theme } : {}),
			height: isProfileUiRowHeight(contentName) ? -1 : rawContent.height,
			edgeRadius: rawContent.edgeRadius,
			boxOpacity: Math.round(rawContent.boxOpacity * 10) / 10,
			color:
				rawContent.color === null ? null : rawContent.color.toLowerCase(),
		});
	}
	return normalizeProfileUi(contents);
};

// Version 1 documents are accepted only to migrate layouts saved before areas
// were removed. The editor and renderer always receive a flat content list.
export const parseProfileUiDocument = (stored: unknown): ProfileUiItem[] | null => {
	let value: unknown = stored;
	if (typeof value === "string") {
		try { value = JSON.parse(value); } catch { return null; }
	}
	if (!isRecord(value)) return null;
	if (value.version === 2) return parseProfileUiContents(value.contents, true);
	if (value.version !== 1 || !Array.isArray(value.areas) || value.areas.length > 20) return null;
	const contents: ProfileUiItem[] = [];
	for (const area of value.areas) {
		if (!isRecord(area) || !isValidWidth(area.width) ||
			(area.arrangeDirection !== "horizontal" && area.arrangeDirection !== "vertical") ||
			!Array.isArray(area.contents) || area.contents.length > 40) return null;
		const items = parseProfileUiContents(area.contents, true);
		if (!items) return null;
		for (const item of items) contents.push({
			...item,
			width: Math.max(1, Math.round(Math.round(area.width * 100) *
				(area.arrangeDirection === "vertical" ? 100 : Math.round(item.width * 100)) / 100)) / 100,
		});
	}
	return normalizeProfileUi(contents);
};

export const hexToHsl = (hex: string) => {
	const red = Number.parseInt(hex.slice(0, 2), 16) / 255;
	const green = Number.parseInt(hex.slice(2, 4), 16) / 255;
	const blue = Number.parseInt(hex.slice(4, 6), 16) / 255;
	const max = Math.max(red, green, blue);
	const min = Math.min(red, green, blue);
	const lightness = (max + min) / 2;
	const delta = max - min;
	if (delta === 0)
		return { hue: 0, saturation: 0, lightness: Math.round(lightness * 100) };

	const saturation =
		delta / (1 - Math.abs(2 * lightness - 1));
	let hue: number;
	if (max === red) hue = 60 * (((green - blue) / delta) % 6);
	else if (max === green) hue = 60 * ((blue - red) / delta + 2);
	else hue = 60 * ((red - green) / delta + 4);
	if (hue < 0) hue += 360;

	return {
		hue: Math.round(hue * 1000) / 1000,
		saturation: Math.round(saturation * 1000) / 10,
		lightness: Math.round(lightness * 1000) / 10,
	};
};
