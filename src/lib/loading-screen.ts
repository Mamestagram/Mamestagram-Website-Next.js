import "server-only";
import { cache } from "react";
import { writeError } from "@/lib/log";

type LoadingScreenApiResponse = {
	status?: string,
	user_id?: number,
	is_set?: boolean,
	loading_screen?: {
		embed_url?: string
	} | null
};

const getMarketOrigin = (baseDomain: string) => `https://market.${baseDomain}`;

const validateEmbedUrl = (value: string, baseDomain: string) => {
	try {
		const url = new URL(value);
		return url.origin === getMarketOrigin(baseDomain) ? url.toString() : null;
	} catch {
		return null;
	}
};

export const getLoadingScreenEmbedUrl = cache(async (userId: number): Promise<string | null> => {
	if (!Number.isSafeInteger(userId) || userId < 1) return null;
	const baseDomain = process.env.BASE_DOMAIN;
	if (!baseDomain) {
		void writeError(new Error("BASE_DOMAIN is not configured"));
		return null;
	}
	
	try {
		const url = new URL("/v1/get_loading_screen", `https://api.${baseDomain}`);
		url.searchParams.set("userid", userId.toString());
		const response = await fetch(url, {
			cache: "no-store",
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(5000)
		});
		if (!response.ok) {
			void writeError(new Error(`Loading screen API request failed (${response.status})`));
			return null;
		}
		
		const data = await response.json() as LoadingScreenApiResponse;
		if (data.status !== "success" || data.user_id !== userId || data.is_set !== true) return null;
		const embedUrl = data.loading_screen?.embed_url;
		if (!embedUrl) return null;
		
		const validatedUrl = validateEmbedUrl(embedUrl, baseDomain);
		if (!validatedUrl) void writeError(new Error("Loading screen API returned an invalid embed URL"));
		return validatedUrl;
	} catch (error: unknown) {
		void writeError(error);
		return null;
	}
});
