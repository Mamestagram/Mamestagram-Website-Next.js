import type { QueryArgs } from "./connect";
import { executeQuery } from "./connect";
import { countryList } from "./query/leaderboard/country-list";
import { defaultRankingQuery } from "./query/leaderboard/default-ranking";
import { countryRankingQuery } from "./query/leaderboard/country-ranking";
import { clanRankingQuery } from "./query/leaderboard/clan-ranking";
import { writeError } from "@/lib/log";
import { ModeNum } from "@/lib/mode";

type RankingQuery = {
	query: string,
	args: QueryArgs
};

export type RankingList = {
	id: number,
	rank: number,
	country: string, // unused for clan lb
	tag: string | null,
	name: string, // unused for clan lb
	acc: number,
	plays: number,
	pp: number,
	score: number, // unused for dans lb
	ssCount: number, // unused for dans lb
	sCount: number, // unused for dans lb
	aCount: number // unused for dans lb
};

type Ranking = {
	ranking: RankingList[],
	pages: number,
};

// noinspection JSUnusedGlobalSymbols
export enum SortBy {
	performance = "performance",
	score = "score",
	accuracy = "accuracy",
	playcount = "playcount",
	dans = "dans"
}

// noinspection JSUnusedGlobalSymbols
export enum SortByColumnName {
	performance = "pp",
	score = "rscore",
	accuracy = "acc",
	playcount = "plays"
}

export const getCountryList = async () => {
	try {
		return await executeQuery<{ country: string }>(countryList);
	}
	catch (error) {
		writeError(error).then();
		throw error;
	}
}

const getRankingQuery = (mode: ModeNum, sortBy: SortBy, isClan: boolean, country?: string): RankingQuery => {
	const isDans = sortBy === SortBy.dans,
		sortByOrder = !isDans
			? [SortByColumnName[sortBy], ...Object.values(SortByColumnName).filter((value) => value !== SortByColumnName[sortBy])]
			: Object.values(SortByColumnName);
	if (!isClan && country === undefined) { // default
		return {
			query: defaultRankingQuery(isDans, sortByOrder.map((sort) => `${sort} DESC`)),
			args: [mode]
		};
	}
	else if (isClan) { // clan
		return {
			query: clanRankingQuery(isDans, sortByOrder.map((sort) => `AVG(${sort}) DESC`)),
			args: [mode]
		};
	}
	else if (country !== undefined) { // specified country
		return {
			query: countryRankingQuery(isDans, sortByOrder.map((sort) => `${sort} DESC`)),
			args: [mode, country]
		};
	}
	else {
		const errMsg = "Unknown ranking";
		writeError(errMsg).then();
		throw new Error(errMsg);
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

export const getLeaderboard = async (mode: ModeNum, sortBy: SortBy, page: number, isClan: boolean, country?: string): Promise<Ranking> => {
	const { query, args } = getRankingQuery(mode, sortBy, isClan, country);
	try {
		const ranking = await executeQuery<RankingList>(
			`
			${query}
			LIMIT 50
			OFFSET ${(page - 1) * 50}
			`,
			args
		);
		const pages = await getPages(query, args);
		return { ranking, pages };
	}
	catch (error) {
		writeError(error).then();
		throw error;
	}
}