import { fileURLToPath } from "node:url";

const config = {
	plugins: {
		[fileURLToPath(new URL("./postcss-profile-ui-themes.cjs", import.meta.url))]: {},
		[fileURLToPath(new URL("./postcss-accent-colors.cjs", import.meta.url))]: {},
		"@tailwindcss/postcss": {},
	},
};

export default config;
