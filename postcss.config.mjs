import { fileURLToPath } from "node:url";

const config = {
	plugins: {
		[fileURLToPath(new URL("./postcss-accent-colors.cjs", import.meta.url))]: {},
		"@tailwindcss/postcss": {},
	},
};

export default config;
