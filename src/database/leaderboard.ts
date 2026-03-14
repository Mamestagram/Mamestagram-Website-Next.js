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

type RankingOptions = {
	page?: number,
	country?: string,
	clan: boolean
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

const sortColumnNames: Readonly<{ [key in Exclude<SortBy, "dans">]: string }> = Object.freeze({
	performance: "pp",
	score: "rscore",
	accuracy: "acc",
	playcount: "plays"
});

const getCountryList = async () => {
	try {
		return await executeQuery<{ country: string }>(countryList);
	}
	catch (error) {
		writeError(error).then();
		throw error;
	}
}

const getRankingQuery = (mode: ModeNum, sortBy: SortBy, options: RankingOptions): RankingQuery => {
	const sortByOrder = sortBy !== "dans"
		? [
			sortColumnNames[sortBy],
			...Object.values(sortColumnNames).filter((columnName) =>
				columnName !== sortColumnNames[sortBy as keyof typeof sortColumnNames])
		]
		: Object.values(sortColumnNames);
	if (options.country !== undefined && !options.clan) {
		return {
			query: defaultRankingQuery,
			args: [`${sortByOrder}`, mode, `${sortByOrder}`]
		};
	}
	else if (options.clan) {
		return {
			query: clanRankingQuery,
			args: [`${sortByOrder.map((sort) => `AVG(${sort})`)}`, mode, `${sortByOrder.map((sort) => `AVG(${sort})`)}`]
		};
	}
	else /*if (options.country !== undefined)*/ {
		return {
			query: countryRankingQuery,
			args: [`${sortByOrder}`, mode, options.country!, `${sortByOrder}`]
		};
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

const getLeaderboard = async (mode: ModeNum, sortBy: SortBy, options: RankingOptions): Promise<Ranking> => {
	const { query, args } = getRankingQuery(mode, sortBy, options);
	try {
		const ranking = await executeQuery<RankingList>(
			`
				${query}
				LIMIT 50
				${options.page !== undefined ? `OFFSET ${options.page * 50}` : ""}
				`,
			args
		);
		const pages = await getPages(query, args);
		const countries = await getCountryList();
		return { ranking, pages, countries };
	}
	catch (error) {
		writeError(error).then();
		throw error;
	}
}