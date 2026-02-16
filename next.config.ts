import "@/lib/env-config";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	allowedDevOrigins: [process.env.DEV_IP as string],
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "a.mamesosu.net" },
			{ protocol: "https", hostname: "team_avatar.mamesosu.net" }
		]
	}
};

export default nextConfig;
