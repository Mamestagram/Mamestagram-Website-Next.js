import type { QueryArgs } from "./connect";
import { executeQuery } from "./connect";
import { countryListQuery } from "./query/leaderboard/country-list";
import { defaultRankingQuery } from "./query/leaderboard/default-ranking";
import { countryRankingQuery } from "./query/leaderboard/country-ranking";
import { clanUsersStatsQuery, clanUsersDanStatsQuery } from "./query/leaderboard/clan-ranking";
import { writeError } from "@/lib/log";
import { sum, generalizedMean } from "@/lib/functions";
import { ModeNum } from "@/lib/mode";

type RankingQuery = {
	query: string,
	args: QueryArgs
};

export type RankingList = {
	id: number,
	rank: number,
	country: string, // unused for clan lb
	tag: string | null, // unused for clan lb
	name: string,
	acc: number,
	plays: number,
	pp: number,
	score: number, // unused for dans lb
	xCount: number, // unused for dans lb
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
		return await executeQuery<{ country: string }>(countryListQuery);
	}
	catch (err) {
		writeError(err).then();
		throw new Error("Couldn't get country list");
	}
}

const getRankingQuery = (mode: ModeNum, sortBy: SortBy, country?: string): RankingQuery => {
	const isDans = sortBy === SortBy.dans,
		sortByOrder = !isDans
			? [SortByColumnName[sortBy], ...Object.values(SortByColumnName).filter((value) => value !== SortByColumnName[sortBy])]
			: Object.values(SortByColumnName);
	if (country === undefined) { // default
		return {
			query: defaultRankingQuery(isDans, sortByOrder.map((sort) => `${sort} DESC`)),
			args: [mode]
		};
	}
	/*else if (isClan) { // clan
		return {
			query: clanRankingQuery(isDans, sortByOrder.map((sort) => `AVG(${sort}) DESC`)),
			args: [mode]
		};
	}*/
	else { // specified country
		return {
			query: countryRankingQuery(isDans, sortByOrder.map((sort) => `${sort} DESC`)),
			args: [mode, country]
		};
	}
}

const getPages = async (sqlQuery: string, sqlArgs: QueryArgs) => {
	try {
		const recCount = (await executeQuery(sqlQuery, sqlArgs)).length;
		return Math.ceil(recCount / 50);
	}
	catch (err) {
		writeError(err).then();
		throw new Error("Couldn't get ranking pages");
	}
}

type UsersStats = {
	clan_id: number,
	tag: string,
	acc: number,
	plays: number,
	pp: number,
	rscore: number,
	xCount: number,
	sCount: number,
	aCount: number
};

type UsersDanStats = {
	clan_id: number,
	tag: string,
	acc: number,
	plays: number,
	pp: number
};

const getClanRanking = async (mode: ModeNum, sortBy: SortBy, page: number): Promise<Ranking> => {
	const isDans = sortBy === SortBy.dans,
		sortByOrder = !isDans
			? [SortByColumnName[sortBy], ...Object.values(SortByColumnName).filter((value) => value !== SortByColumnName[sortBy])]
			: Object.values(SortByColumnName);
	const p = 10;
	let clanRanking: RankingList[];
	if (!isDans) {
		const usersStats = await executeQuery<UsersStats>(clanUsersStatsQuery, [mode]);
		const statsByClan: UsersStats[] = [];
		Map.groupBy(usersStats, ({ clan_id }) => clan_id).forEach((clan) => {
			const [
				clan_id,
				tag,
				acc,
				plays,
				pp,
				rscore,
				xCount,
				sCount,
				aCount
			] = [
				clan.at(0)!.clan_id, // clan_id
				clan.at(0)!.tag, // tag
				generalizedMean(clan.map(({ acc }) => acc), p), // acc
				generalizedMean(clan.map(({ plays }) => plays), p), // plays
				generalizedMean(clan.map(({ pp }) => pp), p), // pp
				generalizedMean(clan.map(({ rscore }) => rscore), p), // rscore
				sum(clan.map(({ xCount }) => xCount)), // xCount
				sum(clan.map(({ sCount }) => sCount)), // sCount
				sum(clan.map(({ aCount }) => aCount)) // aCount
			]
			statsByClan.push({ clan_id, tag, acc, plays, pp, rscore, xCount, sCount, aCount });
		});
		statsByClan.sort((a, b) =>
			sortByOrder.reduce((sortKey, value) => sortKey || b[value] - a[value], 0));
		clanRanking = statsByClan.map((stats, i) => ({
			id: stats.clan_id,
			rank: i + 1,
			country: "",
			tag: null,
			name: stats.tag,
			acc: stats.acc,
			plays: stats.plays,
			pp: stats.pp,
			score: stats.rscore,
			xCount: stats.xCount,
			sCount: stats.sCount,
			aCount: stats.aCount
		}));
	}
	else {
		const usersStats = await executeQuery<UsersDanStats>(clanUsersDanStatsQuery, [mode, mode, mode]);
		const statsByClan: UsersDanStats[] = [];
		Map.groupBy(usersStats, ({ clan_id }) => clan_id).forEach((clan) => {
			const [
				clan_id,
				tag,
				acc,
				plays,
				pp
			] = [
				clan.at(0)!.clan_id, // clan_id
				clan.at(0)!.tag, // tag
				generalizedMean(clan.map(({ acc }) => acc), p), // acc
				generalizedMean(clan.map(({ plays }) => plays), p), // plays
				generalizedMean(clan.map(({ pp }) => pp), p) // pp
			];
			statsByClan.push({ clan_id, tag, acc, plays, pp });
		});
		statsByClan.sort((a, b) => b.pp - a.pp || b.acc - a.acc || b.plays - a.plays);
		clanRanking = statsByClan.map((stats, i) => ({
			id: stats.clan_id,
			rank: i + 1,
			country: "",
			tag: null,
			name: stats.tag,
			acc: stats.acc,
			plays: stats.plays,
			pp: stats.pp,
			score: 0,
			xCount: 0,
			sCount: 0,
			aCount: 0
		}));
	}
	return {
		ranking: clanRanking.slice(50 * (page - 1), 50 * page),
		pages: Math.ceil(clanRanking.length / 50),
	};
}

export const getLeaderboard = async (mode: ModeNum, sortBy: SortBy, page: number, isClan: boolean, country?: string): Promise<Ranking> => {
	if (!isClan) {
		const { query, args } = getRankingQuery(mode, sortBy, country);
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
		catch (err) {
			writeError(err).then();
			throw new Error("Couldn't get leaderboard");
		}
	}
	else {
		return await getClanRanking(mode, sortBy, page);
	}
}