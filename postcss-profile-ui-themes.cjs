// Reuse the existing Legacy rules inside a content card without changing its siblings.
const legacyRoot = 'html[data-theme="legacy"]';
const legacyScope = '[data-profile-ui-theme="legacy"]';
const glassScope = '[data-profile-ui-theme="glass"]';
const excludeGlass = `:not(:where(${glassScope}, ${glassScope} *))`;

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
