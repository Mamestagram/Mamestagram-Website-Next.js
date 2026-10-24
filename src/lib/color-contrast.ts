export type RgbaColor = readonly [number, number, number, number];

export const parseComputedColor = (value: string): RgbaColor | null => {
	if (value === "transparent") return [0, 0, 0, 0];
	const match = value.match(/^rgba?\(([^)]+)\)$/);
	if (!match) return null;
	const channels = match[1].split(/[,\s/]+/).filter(Boolean).map(Number);
	if (channels.length < 3 || channels.some((channel) => !Number.isFinite(channel))) return null;
	return [channels[0], channels[1], channels[2], channels[3] ?? 1];
};

export const compositeColor = (foreground: RgbaColor, background: RgbaColor): RgbaColor => {
	const alpha = foreground[3] + background[3] * (1 - foreground[3]);
	if (alpha === 0) return [0, 0, 0, 0];
	const channel = (index: number) =>
		(foreground[index] * foreground[3] + background[index] * background[3] * (1 - foreground[3])) / alpha;
	return [channel(0), channel(1), channel(2), alpha];
};

const luminance = (color: RgbaColor): number => {
	const linear = color.slice(0, 3).map((channel) => {
		const value = channel / 255;
		return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
	});
	return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
};

export const contrastRatio = (foreground: RgbaColor, background: RgbaColor): number => {
	const first = luminance(compositeColor(foreground, background));
	const second = luminance(background);
	return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
};

// Keep readable colors and preserve accent hues when adjusting contrast across gradient stops.
export const getReadableTextOverride = (foreground: RgbaColor, backgrounds: readonly RgbaColor[], preserveChroma = true): string | null => {
	if (foreground[3] === 0 || backgrounds.length === 0) return null;
	const minimum = (color: RgbaColor) => Math.min(...backgrounds.map((background) => contrastRatio(color, background)));
	const original = minimum(foreground);
	if (original >= 4.5) return null;
	const black = minimum([0, 0, 0, 1]);
	const white = minimum([255, 255, 255, 1]);
	if (Math.max(black, white) <= original) return null;
	const endpoint = black >= white ? 0 : 255;
	if (preserveChroma && Math.max(...foreground.slice(0, 3)) - Math.min(...foreground.slice(0, 3)) >= 16 && Math.max(black, white) >= 4.5) {
		const shade = (amount: number): RgbaColor => [
			foreground[0] + (endpoint - foreground[0]) * amount,
			foreground[1] + (endpoint - foreground[1]) * amount,
			foreground[2] + (endpoint - foreground[2]) * amount,
			1,
		];
		let low = 0, high = 1;
		for (let step = 0; step < 16; step++) {
			const middle = (low + high) / 2;
			if (minimum(shade(middle)) >= 4.5) high = middle;
			else low = middle;
		}
		const color = shade(high);
		return `rgb(${color.slice(0, 3).map((channel) => channel.toFixed(3)).join(", ")})`;
	}
	return black >= white ? "black" : "white";
};
