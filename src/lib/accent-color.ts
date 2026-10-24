import type { CSSProperties } from "react";
import { hexToHsl } from "@/lib/profile-ui";

export const isAccentColor = (value: unknown): value is string =>
	typeof value === "string" && /^#[\da-f]{6}$/i.test(value);

export const normalizeAccentColor = (value: unknown): string | null =>
	isAccentColor(value) ? value.toLowerCase() : null;

export const hueToAccentColor = (hue: number): string => {
	const channel = (offset: number) => {
		const phase = (offset + hue / 30) % 12;
		const value = 0.6 - 0.24 * Math.max(-1, Math.min(phase - 3, 9 - phase, 1));
		return Math.round(value * 255).toString(16).padStart(2, "0");
	};
	return `#${channel(0)}${channel(8)}${channel(4)}`;
};

export const getAccentHue = (color: string | null): number | null =>
	color === null ? null : Math.round(hexToHsl(color.slice(1)).hue);

export type AccentColorStyle = CSSProperties & {
	"--user-hue"?: number;
	"--accent-saturation-scale"?: number;
	"--accent-lightness-shift"?: string;
};

export const getAccentColorStyle = (color: string | null): AccentColorStyle => {
	if (color === null) return {};
	const { hue, saturation, lightness } = hexToHsl(color.slice(1));
	return {
		"--user-hue": hue,
		"--accent-saturation-scale": saturation / 60,
		"--accent-lightness-shift": `${lightness - 60}%`,
	};
};

export const accentColorProperties = [
	"--user-hue",
	"--accent-saturation-scale",
	"--accent-lightness-shift",
] as const;

export const applyAccentColor = (root: HTMLElement, color: string | null, hue: number | null, defaultHue: number) => {
	const style: AccentColorStyle = {
		"--user-hue": hue ?? defaultHue,
		"--accent-saturation-scale": 1,
		"--accent-lightness-shift": "0%",
		...getAccentColorStyle(color),
	};
	for (const property of accentColorProperties)
		root.style.setProperty(property, String(style[property]));
	if (color === null) delete root.dataset.accentColor;
	else root.dataset.accentColor = color;
	const effectiveHue = getAccentHue(color) ?? hue;
	if (effectiveHue === null) delete root.dataset.userHue;
	else root.dataset.userHue = String(effectiveHue);
};
