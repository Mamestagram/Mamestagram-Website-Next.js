import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	allowedDevOrigins: [process.env.DEV_IP as string],
	compress: process.env.NODE_ENV === "production",
	experimental: {
		instantInsights: {
			validationLevel: "warning"
		}
	},
	images: {
		unoptimized: true,
		localPatterns: [
			{ pathname: "/**" }
		],
		remotePatterns: [
			{ protocol: "https", hostname: "**" },
			{ protocol: "http", hostname: "**" }
		]
	}
};

export default nextConfig;
