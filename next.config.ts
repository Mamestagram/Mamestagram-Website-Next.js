import "@/lib/env-config";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	allowedDevOrigins: [process.env.DEV_IP as string],
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: `a.${process.env.BASE_DOMAIN}`, }
		]
	}
};

export default nextConfig;
