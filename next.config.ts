import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	allowedDevOrigins: [process.env.DEV_IP as string],
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: `a.${process.env.BASE_DOMAIN}` },
			{ protocol: "https", hostname: `clan-a.${process.env.BASE_DOMAIN}` },
			{ protocol: "https", hostname: `img.${process.env.BASE_DOMAIN}` },
			{ protocol: "https", hostname: "img.mamesosu.net" },
			{ protocol: "https", hostname: `assets.${process.env.BASE_DOMAIN}` },
			{ protocol: "https", hostname: "assets.mamesosu.net" },
			{ protocol: "https", hostname: "assets.ppy.sh" },
			{ protocol: "https", hostname: "i.imgur.com" },
			{ protocol: "https", hostname: "cdn.discordapp.com" },
			{ protocol: "https", hostname: "media.discordapp.net" },
			{ protocol: "https", hostname: "images-ext-1.discordapp.net" },
			{ protocol: "https", hostname: "images-ext-2.discordapp.net" },
			{ protocol: "https", hostname: "raw.githubusercontent.com" },
			{ protocol: "https", hostname: "user-images.githubusercontent.com" },
			{ protocol: "https", hostname: "avatars.githubusercontent.com" },
			{ protocol: "https", hostname: "upload.wikimedia.org" },
			{ protocol: "https", hostname: "pbs.twimg.com" },
			{ protocol: "https", hostname: "abs.twimg.com" },
			{ protocol: "https", hostname: "cdn.bsky.app" },
			{ protocol: "https", hostname: "media.tenor.com" },
			{ protocol: "https", hostname: "c.tenor.com" },
			{ protocol: "https", hostname: "media.giphy.com" },
			{ protocol: "https", hostname: "i.giphy.com" },
			{ protocol: "https", hostname: "static-cdn.jtvnw.net" },
			{ protocol: "https", hostname: "images.unsplash.com" },
			{ protocol: "https", hostname: "i.ppy.sh" }
		]
	}
};

export default nextConfig;
