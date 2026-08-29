export enum WebTheme {
	glass,
	legacy,
}

export const DEFAULT_WEB_THEME = WebTheme.legacy;
export const MIN_WEB_HUE = 0;
export const MAX_WEB_HUE = 360;

export const webThemeValues = [WebTheme.glass, WebTheme.legacy] as const;

export type WebThemeName = "glass" | "legacy";

const webThemeNames = {
	[WebTheme.glass]: "glass",
	[WebTheme.legacy]: "legacy",
} satisfies Record<WebTheme, WebThemeName>;

export const isWebTheme = (value: unknown): value is WebTheme =>
	typeof value === "number" && webThemeValues.some((theme) => theme === value);

export const normalizeWebTheme = (value: unknown): WebTheme =>
	isWebTheme(value) ? value : DEFAULT_WEB_THEME;

export const isWebHue = (value: unknown): value is number =>
	typeof value === "number" &&
	Number.isInteger(value) &&
	value >= MIN_WEB_HUE &&
	value <= MAX_WEB_HUE;

export const normalizeWebHue = (value: unknown): number | null =>
	isWebHue(value) ? value : null;

export const getWebThemeName = (theme: WebTheme): WebThemeName =>
	webThemeNames[theme];
