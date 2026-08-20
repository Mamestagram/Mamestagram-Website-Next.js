import "server-only";
import { cache } from "react";
import { executeQuery } from "@/database/connection";
import {
	beatmapDifficultiesQuery,
	beatmapScoreIdsQuery,
	beatmapUserRankQuery,
	beatmapUserScoreQuery,
	scoreCountriesQuery
} from "@/database/query/beatmap";
import { ModeNum } from "@/lib/mode";

export type Beatmap = {
	server: "osu!" | "private",
	id: number,
	setId: number,
	status: number,
	md5: string,
	artist: string,
	title: string,
	version: string,
	creator: string,
	totalLength: number,
	maxCombo: number,
	plays: number,
	passes: number,
	mode: ModeNum,
	bpm: number,
	cs: number,
	ar: number,
	od: number,
	hp: number,
	difficulty: number
};

export type BeatmapDifficulty = Pick<Beatmap, "id" | "setId" | "version" | "mode" | "difficulty" | "cs">;

export type BeatmapScore = {
	id: number,
	userId: number,
	name: string,
	country: string,
	score: number,
	pp: number,
	accuracy: number,
	maxCombo: number,
	mods: number,
	n300: number,
	n100: number,
	n50: number,
	nMiss: number,
	nGeki: number,
	nKatu: number,
	grade: string,
	playTime: Date
};

export type RankedBeatmapScore = BeatmapScore & { rank: number };
type BeatmapScoreRow = BeatmapScore;

type BeatmapApiMap = {
	id: number,
	set_id: number,
	status: number,
	md5: string,
	artist: string,
	title: string,
	version: string,
	creator: string,
	total_length: number,
	max_combo: number,
	plays: number,
	passes: number,
	mode: ModeNum,
	bpm: number,
	cs: number,
	ar: number,
	od: number,
	hp: number,
	diff: number
};

type BeatmapInfoApi = {
	status: string,
	map?: BeatmapApiMap
};

const getApiUrl = (endpoint: "get_map_info" | "get_map_scores", params: Record<string, string | number>) => {
	const baseDomain = process.env.BASE_DOMAIN;
	if (!baseDomain) throw new Error("BASE_DOMAIN is not configured");
	const url = new URL(`/v1/${endpoint}`, `https://api.${baseDomain}`);
	Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value.toString()));
	return url;
};

const getApiJson = async <T>(url: URL): Promise<T | null> => {
	const response = await fetch(url, {
		cache: "no-store",
		headers: { Accept: "application/json" }
	});
	if (!response.ok) {
		if (response.status >= 400 && response.status < 500) return null;
		throw new Error(`Beatmap API request failed (${response.status} ${response.statusText})`);
	}
	return await response.json() as T;
};

const toBeatmap = (map: BeatmapApiMap): Beatmap => ({
	server: "osu!",
	id: map.id,
	setId: map.set_id,
	status: map.status,
	md5: map.md5,
	artist: map.artist,
	title: map.title,
	version: map.version,
	creator: map.creator,
	totalLength: map.total_length,
	maxCombo: map.max_combo,
	plays: map.plays,
	passes: map.passes,
	mode: map.mode,
	bpm: map.bpm,
	cs: map.cs,
	ar: map.ar,
	od: map.od,
	hp: map.hp,
	difficulty: map.diff
});

export const getBeatmap = cache(async (setId: number, mapId: number): Promise<Beatmap | null> => {
	const response = await getApiJson<BeatmapInfoApi>(getApiUrl("get_map_info", { id: mapId }));
	if (!response?.map || response.status !== "success" || response.map.set_id !== setId) return null;
	return toBeatmap(response.map);
});

export const getBeatmapDifficulties = async (setId: number, server: Beatmap["server"]): Promise<BeatmapDifficulty[]> => {
	const maps = await executeQuery<Pick<BeatmapApiMap, "id" | "set_id" | "version" | "mode" | "diff" | "cs">>(
		beatmapDifficultiesQuery,
		[setId, server]
	);
	return maps.map((map) => ({
		id: map.id,
		setId: map.set_id,
		version: map.version,
		mode: map.mode,
		difficulty: map.diff,
		cs: map.cs
	}));
};

type BeatmapScoreApiRow = {
	id?: number,
	map_md5: string,
	userid: number,
	player_name: string,
	country?: string,
	score: number,
	pp: number,
	acc: number,
	max_combo: number,
	mods: number,
	n300: number,
	n100: number,
	n50: number,
	nmiss: number,
	ngeki: number,
	nkatu: number,
	grade: string,
	play_time: string
};

type BeatmapScoresApi = {
	status: string,
	scores?: BeatmapScoreApiRow[]
};

type BeatmapScoreIdRow = {
	id: number,
	userId: number,
	score: number,
	mods: number,
	playTime: string
};

const getScoreIdentity = ({ userid, score, mods, play_time }: Pick<
	BeatmapScoreApiRow,
	"userid" | "score" | "mods" | "play_time"
>) => `${userid}:${score}:${mods}:${play_time}`;

const getBeatmapScoreIds = async (scores: BeatmapScoreApiRow[], mode: ModeNum) => {
	const scoresWithoutIds = scores.filter((score) => score.id === undefined);
	if (scoresWithoutIds.length === 0) return new Map<string, number>();
	const scoreIds = await executeQuery<BeatmapScoreIdRow>(
		beatmapScoreIdsQuery(scoresWithoutIds.length),
		[
			scoresWithoutIds[0].map_md5,
			mode,
			...scoresWithoutIds.flatMap((score) => [score.userid, score.score, score.mods, score.play_time])
		]
	);
	return new Map(scoreIds.map((score) => [
		`${score.userId}:${score.score}:${score.mods}:${score.playTime}`,
		score.id
	]));
};

const getScoreCountries = async (scores: BeatmapScoreApiRow[]) => {
	const userIds = [...new Set(scores.filter((score) => !score.country).map((score) => score.userid))];
	if (userIds.length === 0) return new Map<number, string>();
	const countries = await executeQuery<{ id: number, country: string }>(
		scoreCountriesQuery(userIds.length),
		userIds
	);
	return new Map(countries.map(({ id, country }) => [id, country]));
};

export const getBeatmapScores = async (mapId: number, mode: ModeNum): Promise<BeatmapScore[]> => {
	const response = await getApiJson<BeatmapScoresApi>(getApiUrl("get_map_scores", {
		id: mapId,
		scope: "best",
		mode,
		limit: 100
	}));
	if (!response || response.status !== "success") return [];
	const scores = response.scores ?? [];
	const [countries, scoreIds] = await Promise.all([
		getScoreCountries(scores),
		getBeatmapScoreIds(scores, mode)
	]);
	return scores.map((score, index) => ({
		id: score.id ?? scoreIds.get(getScoreIdentity(score)) ?? -(index + 1),
		userId: score.userid,
		name: score.player_name,
		country: score.country ?? countries.get(score.userid) ?? "xx",
		score: score.score,
		pp: score.pp,
		accuracy: score.acc,
		maxCombo: score.max_combo,
		mods: score.mods,
		n300: score.n300,
		n100: score.n100,
		n50: score.n50,
		nMiss: score.nmiss,
		nGeki: score.ngeki,
		nKatu: score.nkatu,
		grade: score.grade,
		playTime: new Date(score.play_time)
	}));
};

export const getBeatmapUserScore = async (
	mapMd5: string,
	mode: ModeNum,
	userId: number
): Promise<RankedBeatmapScore | null> => {
	const scores = await executeQuery<BeatmapScoreRow>(
		beatmapUserScoreQuery,
		[mapMd5, mode, userId]
	);
	const score = scores[0];
	if (!score) return null;

	const rankRows = await executeQuery<{ higherScores: number }>(
		beatmapUserRankQuery,
		[mapMd5, mode, score.score]
	);

	return {
		...score,
		rank: Number(rankRows[0]?.higherScores ?? 0) + 1
	};
};
