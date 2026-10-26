// Reuse the existing Legacy rules inside a content card without changing its siblings.
const legacyRoot = 'html[data-theme="legacy"]';
const legacyScope = '[data-profile-ui-theme="legacy"]';
const glassScope = '[data-profile-ui-theme="glass"]';
const excludeGlass = `:not(:where(${glassScope}, ${glassScope} *))`;

// Scale background colors without fading card text, icons, or images.
const scaleChildBackground = (value, postcss) => {
	let result = "", offset = 0;
	for (const match of value.matchAll(/\bhsla?\(/g)) {
		if (match.index < offset) continue;
		const start = match.index + match[0].length;
		let end = start, depth = 1;
		for (; end < value.length && depth; end++) {
			if (value[end] === "(") depth++;
			else if (value[end] === ")") depth--;
		}
		if (depth) break;
		const parts = postcss.list.comma(value.slice(start, end - 1));
		if (parts.length !== 3 && parts.length !== 4) continue;
		result += value.slice(offset, match.index) + `hsla(${parts.slice(0, 3).join(", ")}, calc(${parts[3] ?? "1"} * var(--profile-ui-child-opacity, 1)))`;
		offset = end;
	}
	return result + value.slice(offset);
};

const hasLegacyParent = (rule) => {
	for (let parent = rule.parent; parent; parent = parent.parent)
		if (parent.type === "rule" && parent.selector.includes(legacyRoot)) return true;
	return false;
};

const scopeLegacySelector = (selector) => {
	const global = selector.startsWith(`:global(${legacyRoot})`);
	const prefix = global ? `:global(${legacyScope})` : legacyScope;
	const originalPrefix = global ? `:global(${legacyRoot})` : legacyRoot;
	if (!selector.startsWith(originalPrefix)) return null;
	let tail = selector.slice(originalPrefix.length);
	if (tail === "[data-user-hue]") return `html[data-user-hue] ${legacyScope}:not([data-custom-hue="false"]),\n${legacyScope}[data-custom-hue="true"],\n${legacyScope}[data-custom-color="true"]`;
	// Page backgrounds belong to the profile, rather than an individual card.
	if (/^\s+body\s*(?:::|$)/.test(tail)) return null;
	tail = tail.replace(/^\s+body\s+/, " ");
	tail = tail.replace(/^\s+(?:\[class\*=["']_profile_page["']]|\.profile_page)(?=\s|$)/, "");
	return prefix + tail;
};

module.exports = () => ({
	postcssPlugin: "mamestagram-profile-ui-themes",
	Once(root, { postcss }) {
		const file = root.source?.input.file ?? "";
		if (/[\\/]profile\.module\.css$/.test(file) || /[\\/]settings\.module\.css$/.test(file) || /[\\/]global[\\/]theme\.css$/.test(file)) {
			root.walkDecls((declaration) => {
				const childColor = /^--profile-ui-child-(?:hover-|icon-)?background$/.test(declaration.prop);
				if (!childColor && !/^background(?:-color|-image)?$/.test(declaration.prop)) return;
				const selector = declaration.parent.selector ?? "";
				if (/[\\/]global[\\/]theme\.css$/.test(file)) {
					let parent = declaration.parent;
					for (; parent; parent = parent.parent)
						if (parent.type === "rule" && /_profile_page|_player_scores/.test(parent.selector)) break;
					if (!parent) return;
				}
				// Outer content backgrounds already use the parent's opacity directly.
				if (/profile_ui_customized.*>\s*\.section_box$/.test(selector) || selector === '& [class*="_section_box"]') return;
				if (file.endsWith("settings.module.css") && !childColor && !/profile_ui_preview_(?:mock|me_|score|achievement)/.test(selector)) return;
				declaration.value = scaleChildBackground(declaration.value, postcss);
			});
		}
		const originalRules = [];
		root.walkRules((rule) => originalRules.push(rule));
		for (const rule of originalRules) {
			if (!rule.selector.includes(legacyRoot) || hasLegacyParent(rule)) continue;
			const selectors = postcss.list.comma(rule.selector).map(scopeLegacySelector).filter(Boolean);
			if (selectors.length) rule.after(rule.clone({ selector: selectors.join(",\n") }));
		}
		for (const rule of originalRules) {
			const inherited = hasLegacyParent(rule);
			if (!inherited && !rule.selector.includes(legacyRoot)) continue;
			rule.selector = postcss.list.comma(rule.selector).map((selector) => {
				if (!inherited && !selector.includes(legacyRoot)) return selector;
				const pseudo = selector.match(/(::[\w-]+(?:\([^)]*\))?)$/);
				return pseudo
					? selector.slice(0, -pseudo[0].length) + excludeGlass + pseudo[0]
					: selector + excludeGlass;
			}).join(",\n");
		}
		// Glass cards must not inherit Legacy's root-level surface variables.
		if (/[\\/]global[\\/]global\.css$/.test(root.source?.input.file ?? "")) {
			const defaults = originalRules.find((rule) => rule.selector === ":root");
			if (!defaults) return;
			const glass = postcss.rule({ selector: glassScope });
			for (const node of defaults.nodes)
				if (node.type === "decl" && /^--(?:glass-|text-(?:main|sub)$|grid-(?:minor|major)$)/.test(node.prop)) glass.append(node.clone());
			glass.append(postcss.decl({ prop: "--profile-surface-hue", value: "var(--user-hue, 210)" }));
			defaults.after(glass);
		}
	},
});
module.exports.postcss = true;
