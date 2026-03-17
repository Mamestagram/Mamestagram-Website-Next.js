import type { QueryArgs } from "./connect";
import { executeQuery } from "./connect";
import { countryList } from "./query/leaderboard/country-list";
import { defaultRankingQuery } from "./query/leaderboard/default-ranking";
import { countryRankingQuery } from "./query/leaderboard/country-ranking";
import { clanRankingQuery } from "./query/leaderboard/clan-ranking";
import { writeError } from "@/lib/log";
import { ModeNum } from "@/lib/mode";

export type SortBy = "performance" | "score" | "accuracy" | "playcount" | "dans";

type RankingList = {
	id: number,
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

type RankingQuery = {
	query: string,
	args: QueryArgs
};

type Ranking = {
	ranking: RankingList[],
	pages: number,
	countries: { country: string }[]
}

enum SortColumnName {
	performance = "pp",
	score = "rscore",
	accuracy = "acc",
	playcount = "plays"
}

const getCountryList = async () => {
	try {
		return await executeQuery<{ country: string }>(countryList);
	}
	catch (error) {
		writeError(error).then();
		throw error;
	}
}

const getRankingQuery = (mode: ModeNum, sortBy: SortBy, clan: boolean, country?: string): RankingQuery => {
	const sortByOrder = sortBy !== "dans"
		? [
			SortColumnName[sortBy],
			...Object.values(SortColumnName).filter((columnName) => columnName !== SortColumnName[sortBy]),
		]
		: Object.values(SortColumnName);
	const rankningQueryKey = sortBy !== "dans" ? "normal" : sortBy;
	if (!clan && country === undefined) {
		return {
			query: defaultRankingQuery[rankningQueryKey],
			args: sortBy !== "dans"
				? [`${sortByOrder}`, mode, `${sortByOrder}`]
				: [mode]
		};
	}
	else if (clan) {
		return {
			query: clanRankingQuery[rankningQueryKey],
			args: sortBy !== "dans"
				? [`${sortByOrder.map((sort) => `AVG(${sort})`)}`, mode, `${sortByOrder.map((sort) => `AVG(${sort})`)}`]
				: [mode]
		};
	}
	else if (country !== undefined) {
		return {
			query: countryRankingQuery[rankningQueryKey],
			args: sortBy !== "dans"
				? [`${sortByOrder}`, mode, country, `${sortByOrder}`]
				: [mode, country]
		};
	}
	else {
		return { query: "", args: null };
	}
}

const getPages = async (sqlQuery: string, sqlArgs: QueryArgs) => {
	try {
		const recCount = (await executeQuery(sqlQuery, sqlArgs)).length;
		return Math.ceil(recCount / 50);
	}
	catch (error) {
		writeError(error).then();
		throw error;
	}
}

export const getLeaderboard = async (mode: ModeNum, sortBy: SortBy, page: number, clan: boolean, country?: string): Promise<Ranking> => {
	const { query, args } = getRankingQuery(mode, sortBy, clan, country);
	try {
		const countries = await getCountryList();
		const ranking = await executeQuery<RankingList>(
			`
			${query}
			LIMIT 50
			OFFSET ${(page - 1) * 50}
			`,
			args
		);
		const pages = await getPages(query, args);
		return { countries, ranking, pages };
	}
	catch (error) {
		writeError(error).then();
		throw error;
	}
}