import { cache } from "react";
import { executeQuery } from "./connection";
import {
	clanProfileRouteInfoQuery,
	clanOwnerQuery,
	followingQuery,
	followersQuery,
	mutualQuery,
	removableClanMemberQuery,
	removeClanMemberQuery,
	updateClanPreferredModeQuery,
	updateClanUserpageContentQuery,
	updateUserPreferredModeQuery,
	updateUserpageContentQuery,
	userExistsQuery,
	userJoinedClanQuery,
	userNameQuery,
	userPreferredModeQuery,
	userProfileRouteInfoQuery
} from "./query/profile/user-info";
import {
	dansBestPPQuery,
	dansFirstPlaceQuery,
	dansMostPlayedQuery,
	dansRecentPlayedQuery,
	firstPlaceMapsQuery
} from "./query/profile/player-scores";
import {
	dansGradeCountQuery,
	dansPPQuery,
	maniaDansPPQuery,
	dansAccQuery,
	dansPlayCountQuery,
	dansMaxComboQuery
} from "./query/profile/statistics/personal-dans";
import {
	medalSkillQuery,
	medalModQuery,
	medalOthersQuery
} from "./query/profile/achievements";
import { ModeNum, OsuMode } from "@/lib/mode";
import { getPrivs, Priv } from "@/lib/priv";
import { BeatmapStatus } from "@/lib/beatmap-status";
import { writeError } from "@/lib/log";
import { getProfileCosmeticsMap } from "@/lib/profile-cosmetics";
import type { ProfileCosmetics } from "@/lib/profile-cosmetics";
import { isPlayerAction, type PlayerAction } from "@/lib/player-action";

type ProfileFetchOptions = {
	timeoutMs?: number,
	timeoutRetries?: number,
	logErrors?: boolean
};

const isTimeoutError = (error: unknown) => error instanceof Error && error.name === "TimeoutError";

const fetchProfileResponse = async (
	url: string,
	label: string,
	init?: RequestInit,
	options: ProfileFetchOptions = {}
) => {
	const timeoutMs = options.timeoutMs ?? 5000;
	const timeoutRetries = init?.signal === undefined ? options.timeoutRetries ?? 0 : 0;
	for (let attempt = 0; attempt <= timeoutRetries; attempt++) {
		try {
			return await fetch(url, {
				...init,
				signal: init?.signal ?? AbortSignal.timeout(timeoutMs)
			});
		} catch (error: unknown) {
			if (isTimeoutError(error) && attempt < timeoutRetries) continue;
			if (options.logErrors !== false) void writeError(error);
			throw new Error(`Couldn't fetch ${label}`, { cause: error });
		}
	}
	throw new Error(`Couldn't fetch ${label}`);
};

export const accountExists = async (id: number, isClan: boolean) => {
	try {
		// personal
		if (!isClan) {
			return (await executeQuery<{ user_exists: 0 | 1 }>(
				userExistsQuery,
				[id]
			)).at(0)!.user_exists === 1;
		}
		// clan
		else {
			return await getClanProfile(id) !== null;
		}
	} catch (err) {
		void writeError(err);
		throw new Error(`Couldn't get ${!isClan ? "user" : "clan"} data`);
	}
}

export const getName = async (id: number, isClan: boolean) => {
	let clanName: string | null = null;
	try {
		// personal
		if (!isClan) {
			return (await executeQuery<{ name: string }>(
				userNameQuery,
				[id]
			)).at(0)!.name;
		}
		// clan
		else {
			const clan = await getClanProfile(id);
			clanName = clan?.info.name ?? null;
		}
	} catch (err) {
		void writeError(err);
		throw new Error(`Couldn't get ${!isClan ? "user" : "clan"} data`);
	}
	if (!clanName) throw new Error("Couldn't get clan data");
	return clanName;
}

export const getPreferredMode = async (id: number, isClan: boolean) => {
	let clanMode: OsuMode | null = null;
	try {
		// presonal
		if (!isClan) {
			const preferredModeNum = (await executeQuery<{ preferred_mode: ModeNum }>(
				userPreferredModeQuery,
				[id]
			)).at(0)!.preferred_mode;
			return ModeNum[preferredModeNum] as OsuMode;
		}
		// clan
		else {
			const clan = await getClanProfile(id);
			clanMode = clan ? ModeNum[clan.info.preferredMode] as OsuMode : null;
		}
	} catch (err) {
		void writeError(err);
		throw new Error(`Couldn't get ${!isClan ? "user" : "clan"}`);
	}
	if (!clanMode) throw new Error("Couldn't get clan");
	return clanMode;
}

export const updateUserpageContent = async (id: number, content: string) => {
	await executeQuery(
		updateUserpageContentQuery,
		[content, id]
	);
}

export const updateClanUserpageContent = async (clanId: number, ownerId: number, content: string) => {
	if (!await isClanOwner(clanId, ownerId)) return false;
	
	await executeQuery(
		updateClanUserpageContentQuery,
		[content, clanId, ownerId]
	);
	return true;
}

export const isClanOwner = async (clanId: number, ownerId: number) => {
	const ownedClan = await executeQuery<{ id: number }>(
		clanOwnerQuery,
		[clanId, ownerId]
	);
	return ownedClan.length > 0;
}

export const updatePreferredMode = async (profileId: number, mode: ModeNum, isClan: boolean, userId: number) => {
	if (isClan) {
		if (!await isClanOwner(profileId, userId)) return false;
		await executeQuery(
			updateClanPreferredModeQuery,
			[mode, profileId, userId]
		);
	}
	else {
		if (profileId !== userId) return false;
		await executeQuery(
			updateUserPreferredModeQuery,
			[mode, userId]
		);
	}
	return true;
}

export const removeClanMember = async (clanId: number, ownerId: number, memberId: number) => {
	const members = await executeQuery<{ id: number }>(
		removableClanMemberQuery,
		[clanId, ownerId, memberId]
	);
	if (members.length === 0) return false;
	
	await executeQuery(
		removeClanMemberQuery,
		[memberId, clanId, ownerId, clanId, ownerId]
	);
	return true;
}

/* info */
export type Profile = {
	tag: string | null, // unused for clan pf
	name: string,
	pastNames: string | null,
	showPastName: boolean,
	country: string, // unused for clan pf
	creationTime: Date,
	latestActivity: Date, // unused for clan pf
	priv: Priv[], // unused for clan pf
	mutual: ProfileConnection[], // unused for clan pf
	following: ProfileConnection[], // unused for clan pf
	followers: ProfileConnection[], // unused for clan pf
	preferredMode: ModeNum,
	userpageContent: string | null,
	ownerId: number | null,
	isOnline: boolean, // unused for clan pf
	activity: PlayerActivity | null, // unused for clan pf
	isPrivate: boolean
};

export type PlayerActivityBeatmap = {
	id: number,
	setId: number,
	artist: string,
	title: string,
	version: string
};

export type PlayerActivity = {
	action: PlayerAction,
	infoText: string | null,
	beatmap: PlayerActivityBeatmap | null
};

export type ProfileConnection = {
	user: number,
	name: string,
	country: string
};

export const getProfileRouteInfo = cache(async (id: number, isClan: boolean): Promise<Pick<
	Profile,
	"preferredMode" | "isPrivate" | "ownerId"
> | null> => {
	if (isClan) {
		const clan = (await executeQuery<{
			preferred_mode: ModeNum,
			owner: number,
			is_public: 0 | 1
		}>(clanProfileRouteInfoQuery, [id])).at(0);
		return clan ? {
			preferredMode: clan.preferred_mode,
			isPrivate: clan.is_public !== 1,
			ownerId: clan.owner
		} : null;
	}
	
	const user = (await executeQuery<{
		preferred_mode: ModeNum,
		is_private: 0 | 1
	}>(userProfileRouteInfoQuery, [id])).at(0);
	return user ? {
		preferredMode: user.preferred_mode,
		isPrivate: user.is_private === 1,
		ownerId: null
	} : null;
});

type PlayerStatusApi = {
	player_status: {
		online: false,
		last_seen: number
	} | {
		online: true,
		login_time: number,
		status: {
			action: unknown,
			info_text: string,
			mode: number,
			mods: number,
			beatmap: unknown
		}
	}
};

type PlayerInfoApi = {
	player: {
		info: {
			name: string,
			priv: number,
			country: string,
			creation_time: number,
			userpage_content: string | null,
			show_past_name: 0 | 1,
			past_name: string,
			latest_activity: number,
			clan_id: number,
			preferred_mode: ModeNum,
			private: 0 | 1
		}
	}
};

function parsePlayerActivityBeatmap(value: unknown): PlayerActivityBeatmap | null {
	if (typeof value !== "object" || value === null) return null;
	
	const beatmap = value as Record<string, unknown>;
	if (!Number.isInteger(beatmap.id)
		|| !Number.isInteger(beatmap.set_id)
		|| typeof beatmap.artist !== "string"
		|| typeof beatmap.title !== "string"
		|| typeof beatmap.version !== "string") return null;
	
	return {
		id: beatmap.id as number,
		setId: beatmap.set_id as number,
		artist: beatmap.artist,
		title: beatmap.title,
		version: beatmap.version
	};
}

export const getUserInfo = async (id: number): Promise<Profile> => {
	const apiUrl = !Boolean(Number(process.env.LOCAL_ONLY)) ? [
		`https://api.${process.env.BASE_DOMAIN}/v1/get_player_status?id=${id}`,
		`https://api.${process.env.BASE_DOMAIN}/v1/get_player_info?id=${id}&scope=info`
	] : [
		`${process.env.BASE_URL}/api/v1/get_player_status?id=${id}`,
		`${process.env.BASE_URL}/api/v1/get_player_info?id=${id}&scope=info`
	];
	const mamesosuApi = await Promise.all(apiUrl.map((url, index) =>
		fetchProfileResponse(url, index === 0 ? "player status" : "player info")));
	if (!mamesosuApi.every((response) => response.ok)) {
		let errMsg = "";
		mamesosuApi.forEach((response, index) => {
			if (response.ok) return;
			const label = index === 0 ? "player status" : "player info";
			errMsg += `Couldn't fetch ${label} (status: ${response.status})\n`;
			void writeError(`${response.status}: ${response.statusText} (url: ${apiUrl[index]})`);
		});
		throw new Error(errMsg);
	}
	
	const [playerStatusApi, playerInfoApi] = await Promise.all<[Promise<PlayerStatusApi>, Promise<PlayerInfoApi>]>([
		mamesosuApi[0].json(),
		mamesosuApi[1].json()
	]);
	const playerStatus = playerStatusApi.player_status;
	const playerActivity = playerStatus.online && isPlayerAction(playerStatus.status.action)
		? {
			action: playerStatus.status.action,
			infoText: playerStatus.status.info_text.trim() || null,
			beatmap: parsePlayerActivityBeatmap(playerStatus.status.beatmap)
		}
		: null;
	const playerInfo = playerInfoApi.player.info;
	try {
		const [joinedClan, mutual, following, followers] = await Promise.all([
			executeQuery<{ tag: string }>(userJoinedClanQuery, [playerInfo.clan_id]),
			executeQuery<ProfileConnection>(mutualQuery, [id]),
			executeQuery<ProfileConnection>(followingQuery, [id]),
			executeQuery<ProfileConnection>(followersQuery, [id])
		]);
		return {
			tag: joinedClan.at(0)?.tag ?? null,
			name: playerInfo.name,
			pastNames: playerInfo.past_name,
			showPastName: playerInfo.show_past_name === 1,
			country: playerInfo.country,
			creationTime: new Date(playerInfo.creation_time * 1000),
			latestActivity: new Date(playerInfo.latest_activity * 1000),
			priv: getPrivs(playerInfo.priv),
			mutual,
			following,
			followers,
			preferredMode: playerInfo.preferred_mode,
			userpageContent: playerInfo.userpage_content,
			ownerId: null,
			isOnline: playerStatus.online,
			activity: playerActivity,
			isPrivate: playerInfo.private === 1
		};
	} catch (error: unknown) {
		void writeError(error);
		throw new Error("Couldn't get user info", { cause: error });
	}
};

type ClanApiMember = {
	id: number,
	name: string,
	country: string,
	rank: string
};

type ClanApiStatistics = {
	rank_pp: number,
	rank_score: number,
	rank_dan: number,
	xh_count: number,
	x_count: number,
	sh_count: number,
	s_count: number,
	a_count: number,
	pp: number,
	pp_4k: number,
	pp_6k: number,
	pp_7k: number,
	pp_10k: number,
	acc: number,
	plays: number,
	playtime: number,
	total_hits: number,
	rscore: number,
	tscore: number,
	max_combo: number,
	replay_views: number
};

type ClanApiResponse = {
	id: number,
	name: string,
	tag: string,
	past_tag: string | null,
	show_past_tag: boolean,
	created_at: string,
	preferred_mode: ModeNum,
	userpage_content: string | null,
	public: boolean,
	members: ClanApiMember[],
	owner: ClanApiMember,
	stats: Record<string, ClanApiStatistics>
};

export type ClanMember = ClanApiMember & {
	cosmetics: ProfileCosmetics,
	isOwner: boolean
};

export type ClanProfile = {
	info: Profile,
	members: ClanMember[],
	stats: Record<string, ClanApiStatistics>
};

export const getClanProfile = cache(async (id: number): Promise<ClanProfile | null> => {
	const baseDomain = process.env.BASE_DOMAIN;
	if (!baseDomain) throw new Error("BASE_DOMAIN is not configured");
	const url = `https://api.${baseDomain}/v1/get_clan?id=${id}`;
	const response = await fetchProfileResponse(url, "clan info", { cache: "no-store" });
	if (response.status === 404) return null;
	if (!response.ok) {
		void writeError(`${response.status}: ${response.statusText} (url: ${url})`);
		throw new Error(`Couldn't fetch clan info (status: ${response.status})`);
	}
	
	let clan: ClanApiResponse;
	try {
		clan = await response.json() as ClanApiResponse;
	} catch (error: unknown) {
		void writeError(error);
		throw new Error("Couldn't read clan info", { cause: error });
	}
	if (clan.id !== id || !Array.isArray(clan.members) || !clan.stats) {
		const error = new Error("Invalid clan API response");
		void writeError(error);
		throw new Error("Couldn't read clan info", { cause: error });
	}
	const creationTime = new Date(clan.created_at);
	if (Number.isNaN(creationTime.getTime())) {
		const error = new Error("Invalid clan creation time");
		void writeError(error);
		throw new Error("Couldn't read clan info", { cause: error });
	}
	const memberCosmetics = await getProfileCosmeticsMap(clan.members.map(({ id: memberId }) => memberId));
	return {
		info: {
			tag: null,
			name: clan.tag,
			pastNames: clan.past_tag,
			showPastName: clan.show_past_tag,
			country: "",
			creationTime,
			latestActivity: creationTime,
			priv: [],
			mutual: [],
			following: [],
			followers: [],
			preferredMode: clan.preferred_mode,
			userpageContent: clan.userpage_content,
			ownerId: clan.owner.id,
			isOnline: false,
			activity: null,
			isPrivate: !clan.public
		},
		members: clan.members.map((member) => ({
			...member,
			cosmetics: memberCosmetics.get(member.id) ?? { userId: member.id, badge: null, frame: null },
			isOwner: member.id === clan.owner.id || member.rank.toLowerCase() === "owner"
		})),
		stats: clan.stats
	};
});

/* player scores */
export enum ScoreScope {
	bestPP,
	firstPlace,
	mostPlayed,
	recentPlayed
}

export type PlayerScoreMap = {
	score_id: number,
	set_id: number,
	id: number,
	grade: string,
	title: string,
	artist: string,
	version: string,
	creator: string,
	status: BeatmapStatus,
	mods: number,
	acc: number,
	pp: number
};

export type PlayerMostPlayedMap = {
	set_id: number,
	id: number,
	artist: string,
	title: string,
	version: string,
	creator: string,
	plays: number
};

export const getPlayerScores = async (scope: Exclude<ScoreScope, ScoreScope.mostPlayed>, id: number, mode: ModeNum, isDans: boolean) => {
	let playerScores: PlayerScoreMap[] = [];
	if (!isDans) {
		switch (scope) {
			case ScoreScope.bestPP:
			case ScoreScope.recentPlayed:
			type PlayerScoresApi = {
				scores?: {
					id: number,
					pp: number,
					acc: number,
					mods: number,
					grade: string,
					beatmap: {
						id: number,
						set_id: number,
						artist: string,
						title: string,
						version: string,
						creator: string,
						status: number
					} | null
				}[]
			};
				
				const apiUrl: { [key in ScoreScope.bestPP | ScoreScope.recentPlayed]: string } = !Boolean(Number(process.env.LOCAL_ONLY)) ? {
					[ScoreScope.bestPP]: `https://api.${process.env.BASE_DOMAIN}/v1/get_player_scores?id=${id}&scope=best&mode=${mode}&limit=100`,
					[ScoreScope.recentPlayed]: `https://api.${process.env.BASE_DOMAIN}/v1/get_player_scores?id=${id}&scope=recent&mode=${mode}&limit=100`
				} : {
					[ScoreScope.bestPP]: `${process.env.BASE_URL}/api/v1/get_player_scores?id=${id}&scope=best&mode=${mode}&limit=100`,
					[ScoreScope.recentPlayed]: `${process.env.BASE_URL}/api/v1/get_player_scores?id=${id}&scope=recent&mode=${mode}&limit=100`
				};
				const url = apiUrl[scope];
				const mamesosuApi = await fetchProfileResponse(url, ScoreScope[scope]);
				if (mamesosuApi.ok) {
					const bestPPApi = await mamesosuApi.json() as PlayerScoresApi;
					playerScores = (bestPPApi.scores ?? []).flatMap((score) => {
						const beatmap = score.beatmap;
						if (!beatmap) return [];
						return [{
							score_id: score.id,
							set_id: beatmap.set_id,
							id: beatmap.id,
							grade: score.grade,
							title: beatmap.title,
							artist: beatmap.artist,
							version: beatmap.version,
							creator: beatmap.creator,
							status: beatmap.status,
							mods: score.mods,
							acc: score.acc,
							pp: score.pp
						}];
					});
				}
				else {
					void writeError(`${mamesosuApi.status}: ${mamesosuApi.statusText} (url: ${url})`);
					throw new Error(`Couldn't fetch ${ScoreScope[scope]} (status: ${mamesosuApi.status})\n`);
				}
				break;
			case ScoreScope.firstPlace:
				try {
					playerScores = await executeQuery<PlayerScoreMap>(firstPlaceMapsQuery, [id, mode]);
				} catch (err) {
					void writeError(err);
					throw new Error("Couldn't get first place maps");
				}
				break;
		}
	}
	else {
		try {
			switch (scope) {
				case ScoreScope.bestPP:
					playerScores = await executeQuery<PlayerScoreMap>(dansBestPPQuery, [id, mode]);
					break;
				case ScoreScope.firstPlace:
					playerScores = await executeQuery<PlayerScoreMap>(dansFirstPlaceQuery, [id, mode]);
					break;
				case ScoreScope.recentPlayed:
					playerScores = await executeQuery<PlayerScoreMap>(dansRecentPlayedQuery, [id, mode]);
					break;
			}
		} catch (err) {
			void writeError(err);
			throw new Error(`Couldn't get ${scope}`);
		}
	}
	return playerScores;
}

export const getMostPlayedMaps = async (id: number, mode: ModeNum, isDans: boolean) => {
	let maps: PlayerMostPlayedMap[] = [];
	if (!isDans) {
		type PlayerMostPlayedApi = {
			maps: PlayerMostPlayedMap[],
		};
		
		const apiUrl = !Boolean(Number(process.env.LOCAL_ONLY))
			? `https://api.${process.env.BASE_DOMAIN}/v1/get_player_most_played?id=${id}&mode=${mode}&limit=100`
			: `${process.env.BASE_URL}/api/v1/get_player_most_played?id=${id}&mode=${mode}&limit=100`;
		const mamesosuApi = await fetchProfileResponse(apiUrl, "most played maps");
		if (mamesosuApi.ok) {
			maps = (await mamesosuApi.json() as PlayerMostPlayedApi).maps;
		}
		else {
			void writeError(`${mamesosuApi.status}: ${mamesosuApi.statusText} (url: ${apiUrl})`);
			throw new Error(`Couldn't fetch most played maps (status: ${mamesosuApi.status})\n`);
		}
	}
	else {
		try {
			maps = await executeQuery<PlayerMostPlayedMap>(dansMostPlayedQuery, [id, mode]);
		} catch (err) {
			void writeError(err);
			throw new Error("Couldn't get most played maps");
		}
	}
	return maps;
}

/* statistics */
type Rank = {
	global: number,
	country: number, // unused for clan pf
	bancho: number // unused for clan pf
};
type GradeCount = {
	xh: number,
	x: number,
	sh: number,
	s: number,
	a: number
};
type PP = {
	default: number,
	k4: number,
	k6: number,
	k7: number,
	k10: number
};
type PlayTime = {
	days: number,
	hours: number,
	minutes: number
};

export type PlayerStatistics = {
	rank: Rank,
	gradeCount: GradeCount,
	pp: PP,
	acc: number,
	plays: number,
	playtime: PlayTime,
	totalHits: number,
	rankedScore: number,
	totalScore: number,
	maxCombo: number,
	replaysWatched: number
};

const getPlayTimeDHS = (playtime: number): PlayTime => {
	let playtimeSeconds: number = playtime;
	const days = Math.floor(playtimeSeconds / (24 * 60 * 60));
	playtimeSeconds -= days * 24 * 60 * 60;
	const hours = Math.floor(playtimeSeconds / (60 * 60));
	playtimeSeconds -= hours * 60 * 60;
	const minutes = Math.floor(playtimeSeconds / 60);
	return { days, hours, minutes };
}

export const getClanStatistics = (
	clanProfile: ClanProfile,
	mode: ModeNum,
	isDans: boolean
): PlayerStatistics => {
	const stats = clanProfile.stats[String(mode)];
	if (!stats) throw new Error(`Clan statistics are unavailable for mode ${mode}`);
	
	return {
		rank: {
			global: isDans ? stats.rank_dan : stats.rank_pp,
			country: 0,
			bancho: 0
		},
		gradeCount: {
			xh: stats.xh_count,
			x: stats.x_count,
			sh: stats.sh_count,
			s: stats.s_count,
			a: stats.a_count
		},
		pp: {
			default: stats.pp,
			k4: stats.pp_4k,
			k6: stats.pp_6k,
			k7: stats.pp_7k,
			k10: stats.pp_10k
		},
		acc: stats.acc,
		plays: stats.plays,
		playtime: getPlayTimeDHS(stats.playtime),
		totalHits: stats.total_hits,
		rankedScore: stats.rscore,
		totalScore: stats.tscore,
		maxCombo: stats.max_combo,
		replaysWatched: stats.replay_views
	};
};

export const getStatistics = async (id: number, mode: ModeNum, isClan: boolean, isDans: boolean) => {
	let statistics: PlayerStatistics;
	if (!isClan) {
		type PlayerStatsApi = {
			player: {
				stats: {
					[key in ModeNum]: {
						tscore: number,
						rscore: number,
						pp: number,
						plays: number,
						playtime: number,
						acc: number,
						max_combo: number,
						total_hits: number,
						replay_views: number,
						xh_count: number,
						x_count: number,
						sh_count: number,
						s_count: number,
						a_count: number,
						pp_4k: number,
						pp_6k: number,
						pp_7k: number,
						pp_10k: number,
						global_rank_pp: number,
						country_rank_pp: number,
						global_rank_dan: number,
						country_rank_dan: number
					}
				}
			}
		};
		
		const apiUrl = !Boolean(Number(process.env.LOCAL_ONLY))
			? `https://api.${process.env.BASE_DOMAIN}/v1/get_player_info?id=${id}&scope=stats`
			: `${process.env.BASE_URL}/api/v1/get_player_info?id=${id}&scope=stats`;
		const mamesosuApi = await fetchProfileResponse(
			apiUrl,
			"player statistics",
			{ cache: "no-store" },
			{ timeoutMs: 10_000, timeoutRetries: 1 }
		);
		if (mamesosuApi.ok) {
			const playerStats = (await mamesosuApi.json() as PlayerStatsApi).player.stats[mode];
			const playtime = getPlayTimeDHS(playerStats.playtime),
				totalHits = playerStats.total_hits,
				rankedScore = playerStats.rscore,
				totalScore = playerStats.tscore,
				replaysWatched = playerStats.replay_views;
			/* achievements */
			let rank: Rank,
				gradeCount: GradeCount,
				pp: PP,
				acc: number,
				plays: number,
				maxCombo: number;
			if (!isDans) {
				const osudailyApiUrl = `https://osudaily.net/api/pp.php?k=${process.env.OSUDAILY_API_KEY}&v=${playerStats.pp}&t=pp&m=${mode}`;
				let banchoRank = 0;
				if (mode <= ModeNum.mania) {
					try {
						const osudailyApi = await fetchProfileResponse(
							osudailyApiUrl,
							"Bancho rank",
							undefined,
							{ timeoutMs: 3000, logErrors: false }
						);
						if (osudailyApi.ok)
							banchoRank = (await osudailyApi.json() as { rank?: number }).rank ?? 0;
					} catch {
						// Bancho rank is optional; Mamestagram statistics remain available.
					}
				}
				/* rank */
				rank = {
					global: playerStats.global_rank_pp,
					country: playerStats.country_rank_pp,
					bancho: banchoRank
				};
				/* grade count */
				gradeCount = {
					xh: playerStats.xh_count,
					x: playerStats.x_count,
					sh: playerStats.sh_count,
					s: playerStats.s_count,
					a: playerStats.a_count
				};
				/* pp */
				pp = {
					default: playerStats.pp,
					k4: playerStats.pp_4k,
					k6: playerStats.pp_6k,
					k7: playerStats.pp_7k,
					k10: playerStats.pp_10k
				};
				/* acc */
				acc = playerStats.acc;
				/* plays */
				plays = playerStats.plays;
				/* max combo */
				maxCombo = playerStats.max_combo;
			}
			else {
				/* rank */
				rank = {
					global: playerStats.global_rank_dan,
					country: playerStats.country_rank_dan,
					bancho: 0
				};
				try {
					const [
						danGradeCount,
						danReward,
						maniaDanReward,
						danAcc,
						danPlays,
						danMaxCombo
					] = await Promise.all([
						executeQuery<{
							grade: "XH" | "X" | "SH" | "S" | "A",
							count: number
						}>(dansGradeCountQuery, [id, mode]), // gradeCounts
						executeQuery<{ pp: number }>(dansPPQuery, [id, mode]), // danReward
						executeQuery<{ cs: 4 | 6 | 7 | 10, pp: number }>(maniaDansPPQuery, [id]), // maniaDanReward
						executeQuery<{ avg_acc: number }>(dansAccQuery, [id, mode]), // danAcc
						executeQuery<{ count: number }>(dansPlayCountQuery, [id, mode]), // danPlays
						executeQuery<{ combo: number }>(dansMaxComboQuery, [id, mode]) // danMaxCombo
					]);
					/* grade count */
					gradeCount = {
						xh: danGradeCount.find(({ grade }) => grade === "XH")?.count ?? 0,
						x: danGradeCount.find(({ grade }) => grade === "X")?.count ?? 0,
						sh: danGradeCount.find(({ grade }) => grade === "SH")?.count ?? 0,
						s: danGradeCount.find(({ grade }) => grade === "S")?.count ?? 0,
						a: danGradeCount.find(({ grade }) => grade === "A")?.count ?? 0
					};
					/* pp */
					pp = {
						default: danReward.at(0)?.pp ?? 0,
						k4: maniaDanReward.find(({ cs }) => cs === 4)?.pp ?? 0,
						k6: maniaDanReward.find(({ cs }) => cs === 6)?.pp ?? 0,
						k7: maniaDanReward.find(({ cs }) => cs === 7)?.pp ?? 0,
						k10: maniaDanReward.find(({ cs }) => cs === 10)?.pp ?? 0
					};
					/* acc */
					acc = danAcc.at(0)!.avg_acc;
					/* plays */
					plays = danPlays.at(0)!.count;
					/* max combo */
					maxCombo = danMaxCombo.at(0)!.combo;
				} catch (err) {
					void writeError(err);
					throw new Error("Couldn't get stats");
				}
			}
			statistics = {
				rank,
				gradeCount,
				pp,
				acc,
				playtime,
				plays,
				totalHits,
				rankedScore,
				totalScore,
				maxCombo,
				replaysWatched
			};
		}
		else {
			void writeError(`${mamesosuApi.status}: ${mamesosuApi.statusText} (url: ${apiUrl})`);
			throw new Error(`Couldn't fetch player statistics (status: ${mamesosuApi.status})`);
		}
	}
	else {
		const clanProfile = await getClanProfile(id);
		if (!clanProfile) throw new Error("Clan not found");
		statistics = getClanStatistics(clanProfile, mode, isDans);
	}
	return statistics;
}

/* achievements */
export type Medal = {
	id: number,
	filename: string,
	name: string,
	description: string,
	condDescription: string,
	isCollected: boolean
};
export type Achievements = {
	userId: number,
	skill: Medal[],
	mod: Medal[],
	others: Medal[]
};

export const getUserAchievements = async (id: number, mode: ModeNum): Promise<Achievements> => {
	try {
		const [
			skillMedals,
			modMedals,
			otherMedals
		] = await Promise.all([
			executeQuery<Omit<Medal, "isCollected"> & { isCollected: 0 | 1 }>(medalSkillQuery(mode), [id], true), // skillMedals
			executeQuery<Omit<Medal, "isCollected"> & { isCollected: 0 | 1 }>(medalModQuery, [id], true), // modMedals
			executeQuery<Omit<Medal, "isCollected"> & { isCollected: 0 | 1 }>(medalOthersQuery, [id], true) // otherMedals
		]);
		
		return {
			userId: id,
			skill: skillMedals.map(({ isCollected, ...rest }) =>
				({ ...rest, isCollected: Boolean(isCollected) })),
			mod: modMedals.map(({ isCollected, ...rest }) =>
				({ ...rest, isCollected: Boolean(isCollected) })),
			others: otherMedals.map(({ isCollected, ...rest }) =>
				({ ...rest, isCollected: Boolean(isCollected) }))
		}
	} catch (err) {
		void writeError(err);
		throw new Error("Couldn't get achievements");
	}
}
