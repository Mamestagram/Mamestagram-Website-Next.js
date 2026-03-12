import { executeQuery } from "@/database/connect";

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

export const getRankingPages = async (sortBy: SortBy, country?: string) => {
	const ranking = await executeQuery<RankingList>(
	
	);
}

export const getRanking = async (sortBy: SortBy, page: number = 1, country?: string) => {

}