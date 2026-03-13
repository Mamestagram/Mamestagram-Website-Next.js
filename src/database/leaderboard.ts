import { executeQuery } from "@/database/connect";
import { Query } from "mysql2";

export type SortBy = "performance" | "score" | "accuracy" | "playcount" | "dans";

type RankingList = {
	userId: number,
	rank: number,
	country: string,
	tag: string,
	name: string,
	acc: number,
	plays: number,
	pp: number,
	score: number,
	ssCount: number,
	sCount: number,
	aCount: number
};

interface Ranking {
	ranking: RankingList;
}

export class Leaderboard {
	private static readonly sortColumnNames: { [key in Exclude<SortBy, "dans">]: string } = Object.freeze({
		performance: "pp",
		score: "rscore",
		accuracy: "acc",
		playcount: "plays"
	});
	private static readonly ranking = `
		SELECT u.id AS userId,
		       RANK() OVER(ORDER BY ? DESC) 'rank',
		       country,
		       tag,
		       u.name,
		       acc,
		       plays,
		       pp,
		       rscore AS score,
		       xh_count + x_count AS ssCount,
		       sh_count + s_count AS sCount,
		       a_count AS aCount
		    FROM users u
		JOIN stats s
		    ON u.id = s.id
		LEFT JOIN clans c
		    ON clan_id = c.id
		WHERE mode = ?
		    AND NOT u.id = 1
		    AND NOT acc = 0
		    AND (priv & ?) > 0
		ORDER BY ? DESC
		LIMIT 50;
	`
	
	public constructor(sortBy: SortBy, page: number = 1, country?: string) {
	
	}
}

const getRankingQuery = (sortBy: SortBy, country?: string) => {
	const sortByOrder = sortBy !== "dans"
		? [sortColumnNames[sortBy], ...Object.values(sortColumnNames).filter((columnName) => columnName !== sortColumnNames[sortBy])]
		: Object.values(sortColumnNames);
}

export const getRankingPages = async (sortBy: SortBy, country?: string) => {
	const ranking = await executeQuery<RankingList>(
	
	);
}