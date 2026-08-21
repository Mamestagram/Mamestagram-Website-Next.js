import "server-only";

import { executeQuery } from "@/database/connection";
import { homeRecentActivityQuery, homeTopPlayersQuery } from "@/database/query/home";
import { writeError } from "@/lib/log";
import type { ModeNum } from "@/lib/mode";
import { getProfileCosmeticsMap } from "@/lib/profile-cosmetics";
import type { ProfileCosmetics } from "@/lib/profile-cosmetics";

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
	mode: ModeNum,
	cosmetics: ProfileCosmetics
};

type HomeTopPlayerRow = Omit<HomeTopPlayer, "cosmetics">;

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

const globalHomeData = globalThis as typeof globalThis & {
	topPlayers?: HomeTopPlayer[],
	recentActivity?: HomeRecentActivity[]
};

const getPlayerCounts = async (): Promise<HomePlayerCounts | null> => {
	const baseDomain = process.env.BASE_DOMAIN;
	if (!baseDomain) throw new Error("BASE_DOMAIN is not configured");

	try {
		const response = await fetch(`https://api.${baseDomain}/v1/get_player_count`, {
			cache: "no-store",
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(5000)
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
		const rows = await executeQuery<HomeTopPlayerRow>(homeTopPlayersQuery);
		const cosmetics = await getProfileCosmeticsMap(rows.map(({ id }) => id));
		const players = rows.map((player) => ({
			...player,
			cosmetics: cosmetics.get(player.id) ?? { userId: player.id, badge: null, frame: null }
		}));
		globalHomeData.topPlayers = players;
		return players;
	}
	catch (error: unknown) {
		void writeError(error);
		return globalHomeData.topPlayers ?? [];
	}
};

const getRecentActivity = async (): Promise<HomeRecentActivity[]> => {
	try {
		const activity = await executeQuery<HomeRecentActivity>(homeRecentActivityQuery);
		globalHomeData.recentActivity = activity;
		return activity;
	}
	catch (error: unknown) {
		void writeError(error);
		return globalHomeData.recentActivity ?? [];
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
