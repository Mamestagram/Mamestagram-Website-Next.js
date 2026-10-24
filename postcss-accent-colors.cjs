// Adapt existing hue-based shades while keeping neutral text, shadows and semantic colors unchanged.
module.exports = () => ({
	postcssPlugin: "mamestagram-accent-colors",
	Declaration(declaration) {
		if (!declaration.value.includes("--user-hue") && !declaration.value.includes("--profile-surface-hue") && !declaration.value.includes("--profile-preview-surface-hue")) return;
		declaration.value = declaration.value.replace(
			/(hsla?\(\s*var\(--(?:user-hue|profile-surface-hue|profile-preview-surface-hue)(?:\s*,\s*[\d.]+)?\)\s*,\s*)([\d.]+)%(\s*,\s*)([\d.]+)%/g,
			(match, opening, saturation, separator, lightness) => {
				const s = Number(saturation), l = Number(lightness);
				if (s === 0 || l === 0 || l === 100) return match;
				const weight = Math.min(s / 60, 1);
				return `${opening}clamp(0%, calc(${s}% * var(--accent-saturation-scale, 1)), 100%)${separator}clamp(0%, calc(${l}% + var(--accent-lightness-shift, 0%) * ${weight}), 100%)`;
			},
		);
	},
});
module.exports.postcss = true;
