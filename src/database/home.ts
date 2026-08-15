import "server-only";

import { executeQuery } from "@/database/connection";
import { homeRecentActivityQuery, homeTopPlayersQuery } from "@/database/query/home";
import { writeError } from "@/lib/log";
import type { ModeNum } from "@/lib/mode";

export type HomePlayerCounts = {
	online: number,
	total: number,
	stable: number,
	lazer: number
};

export type HomeTopPlayer = {
	id: number,
	name: string,
	country: string,
	pp: number,
	mode: ModeNum
};

export type HomeRecentActivity = {
	id: number,
	userId: number,
	name: string,
	country: string,
	mapId: number,
	setId: number,
	artist: string,
	title: string,
	grade: string,
	pp: number,
	accuracy: number,
	mode: ModeNum,
	playTime: Date
};

type PlayerCountApi = {
	status: string,
	counts?: HomePlayerCounts
};

const getPlayerCounts = async (): Promise<HomePlayerCounts | null> => {
	const baseDomain = process.env.BASE_DOMAIN;
	if (!baseDomain) throw new Error("BASE_DOMAIN is not configured");

	try {
		const response = await fetch(`https://api.${baseDomain}/v1/get_player_count`, {
			cache: "no-store",
			headers: { Accept: "application/json" }
		});
		if (!response.ok) {
			void writeError(new Error(`Player count API request failed (${response.status})`));
			return null;
		}
		const data = await response.json() as PlayerCountApi;
		return data.status === "success" && data.counts ? data.counts : null;
	}
	catch (error: unknown) {
		void writeError(error);
		return null;
	}
};

const getTopPlayers = async (): Promise<HomeTopPlayer[]> => {
	try {
		return await executeQuery<HomeTopPlayer>(homeTopPlayersQuery);
	}
	catch (error: unknown) {
		void writeError(error);
		return [];
	}
};

const getRecentActivity = async (): Promise<HomeRecentActivity[]> => {
	try {
		return await executeQuery<HomeRecentActivity>(homeRecentActivityQuery);
	}
	catch (error: unknown) {
		void writeError(error);
		return [];
	}
};

export const getHomeDashboard = async () => {
	const [playerCounts, topPlayers, recentActivity] = await Promise.all([
		getPlayerCounts(),
		getTopPlayers(),
		getRecentActivity()
	]);
	return { playerCounts, topPlayers, recentActivity };
};
