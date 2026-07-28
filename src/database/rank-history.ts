import "server-only";
import { getRedisClient } from "@/database/redis";
import { ModeNum } from "@/lib/mode";

const RANK_HISTORY_DAYS = 90;

export type RankHistoryPoint = {
	date: string,
	rank: number
};

export type RankHistory = {
	points: RankHistoryPoint[],
	hasData: boolean
};

const toDateKey = (date: Date) => [
	date.getUTCFullYear(),
	String(date.getUTCMonth() + 1).padStart(2, "0"),
	String(date.getUTCDate()).padStart(2, "0")
].join("");

const toDisplayDate = (dateKey: string) =>
	`${dateKey.slice(0, 4)}-${dateKey.slice(4, 6)}-${dateKey.slice(6, 8)}`;

export async function getRankHistory(userId: number, mode: ModeNum): Promise<RankHistory> {
	if (!Number.isInteger(userId) || userId <= 0) return { points: [], hasData: false };

	try {
		const redis = await getRedisClient();
		const key = `mamesosu:rank_history:${mode % 4}:${userId}`;
		const rawHistory = await redis.hGetAll(key);
		const history = new Map<string, number>();

		for (const [dateKey, rawRank] of Object.entries(rawHistory)) {
			if (!/^\d{8}$/.test(dateKey)) continue;
			const rank = Number(rawRank);
			if (Number.isInteger(rank) && rank > 0) history.set(dateKey, rank);
		}

		if (history.size === 0) return { points: [], hasData: false };

		const earliestRank = history.get([...history.keys()].sort()[0])!;
		const today = new Date();
		const points: RankHistoryPoint[] = [];
		let lastKnownRank = earliestRank;

		for (let daysAgo = RANK_HISTORY_DAYS - 1; daysAgo >= 0; daysAgo--) {
			const date = new Date(Date.UTC(
				today.getUTCFullYear(),
				today.getUTCMonth(),
				today.getUTCDate() - daysAgo
			));
			const dateKey = toDateKey(date);
			lastKnownRank = history.get(dateKey) ?? lastKnownRank;
			points.push({ date: toDisplayDate(dateKey), rank: lastKnownRank });
		}

		return { points, hasData: true };
	}
	catch {
		console.warn("[rank-history] Redis history is currently unavailable.");
		return { points: [], hasData: false };
	}
}
