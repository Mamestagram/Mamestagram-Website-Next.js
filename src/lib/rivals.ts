import "server-only";
import { cache } from "react";
import { writeError } from "@/lib/log";

type RivalsApiResponse = {
	status?: unknown,
	user_id?: unknown,
	rivals?: unknown
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

export const isProfileRival = cache(async (userId: number, profileId: number): Promise<boolean> => {
	if (!Number.isSafeInteger(userId) || userId < 1 || !Number.isSafeInteger(profileId) || profileId < 1)
		return false;
	
	const baseDomain = process.env.BASE_DOMAIN;
	if (!baseDomain) {
		void writeError(new Error("BASE_DOMAIN is not configured"));
		return false;
	}
	
	try {
		const url = new URL("/v1/get_rivals", `https://api.${baseDomain}`);
		url.searchParams.set("userid", userId.toString());
		const response = await fetch(url, {
			cache: "no-store",
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(5000)
		});
		if (!response.ok) {
			void writeError(new Error(`Rivals API request failed (${response.status})`));
			return false;
		}
		
		const data = await response.json() as RivalsApiResponse;
		if (data.status !== "success" || data.user_id !== userId || !Array.isArray(data.rivals)) return false;
		return data.rivals.some((rival) => isRecord(rival) && rival.id === profileId);
	} catch (error: unknown) {
		void writeError(error);
		return false;
	}
});
