import { executeQuery } from "./connection";
import {
	clanExistsQuery,
	clanInfoQuery,
	clanOwnerQuery,
	clanPreferredModeQuery,
	clanTagQuery,
	followingQuery,
	followersQuery,
	mutualQuery,
	removableClanMemberQuery,
	removeClanMemberQuery,
	setBadgeQuery,
	updateClanPreferredModeQuery,
	updateClanUserpageContentQuery,
	updateUserPreferredModeQuery,
	updateUserpageContentQuery,
	userExistsQuery,
	userJoinedClanQuery,
	userNameQuery,
	userPreferredModeQuery
} from "./query/profile/user-info";
import { clanMembersDansQuery, clanMembersQuery } from "./query/profile/clan-members";
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
	clanStatsSimpleAggQuery,
	clanStatsComplexAggQuery,
	clanDanGradeCountQuery,
	clanDanMaxComboQuery,
	clanDanRewardAccPlaysQuery,
	clanManiaDanPPQuery
} from "./query/profile/statistics/clan";
import {
	medalSkillQuery,
	medalModQuery,
	medalOthersQuery
} from "./query/profile/achievements";
import { ModeNum, OsuMode } from "@/lib/mode";
import { getPrivs, Priv } from "@/lib/priv";
import { BeatmapStatus } from "@/lib/beatmap-status";
import { writeError } from "@/lib/log";
import { generalizedMean } from "@/lib/aggregate";

const fetchProfileResponse = async (url: string, label: string) => {
	try {
		return await fetch(url);
	}
	catch (error: unknown) {
		void writeError(error);
		throw new Error(`Couldn't fetch ${label}`, { cause: error });
	}
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
			return (await executeQuery<{ clan_exists: 0 | 1 }>(
				clanExistsQuery,
				[id]
			)).at(0)!.clan_exists === 1;
		}
	}
	catch (err) {
		void writeError(err);
		throw new Error(`Couldn't get ${!isClan ? "user" : "clan"} data`);
	}
}

export const getName = async (id: number, isClan: boolean) => {
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
			return (await executeQuery<{ tag: string }>(
				clanTagQuery,
				[id]
			)).at(0)!.tag;
		}
	}
	catch (err) {
		void writeError(err);
		throw new Error(`Couldn't get ${!isClan ? "user" : "clan"} data`);
	}
}

export const getPreferredMode = async (id: number, isClan: boolean) => {
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
			const preferredModeNum = (await executeQuery<{ preferred_mode: ModeNum }>(
				clanPreferredModeQuery,
				[id]
			)).at(0)!.preferred_mode;
			return ModeNum[preferredModeNum] as OsuMode;
		}
	}
	catch (err) {
		void writeError(err);
		throw new Error(`Couldn't get ${!isClan ? "user" : "clan"}`);
	}
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
	setBadge: number, // unused for clan pf
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
	isPrivate: boolean
};

export type ProfileConnection = {
	user: number,
	name: string,
	country: string
};

export const getInfo = async (id: number, isClan: boolean) => {
	let info: Profile;
	if (!isClan) {
		type PlayerStatusApi = {
			player_status: {
				online: boolean
			}
		};
		type PlayerInfoApi = {
			player: {
				info: {
					name: string,
					priv: number,
					country: string,
					creation_time: number, // unix timestamp
					userpage_content: string | null,
					show_past_name: 0 | 1,
					past_name: string,
					latest_activity: number, // unix timestamp
					clan_id: number,
					preferred_mode: ModeNum,
					private: 0 | 1
				}
			}
		};

		// 0: player status, 1: player info
		const apiUrl = !Boolean(Number(process.env.LOCAL_ONLY)) ? [
			`https://api.${process.env.BASE_DOMAIN}/v1/get_player_status?id=${id}`, // player status
			`https://api.${process.env.BASE_DOMAIN}/v1/get_player_info?id=${id}&scope=info` // player info
		] : [
			`${process.env.BASE_URL}/api/v1/get_player_status?id=${id}`, // player status
			`${process.env.BASE_URL}/api/v1/get_player_info?id=${id}&scope=info` // player info
		];
		const mamesosuApi = await Promise.all(apiUrl.map((url, index) =>
			fetchProfileResponse(url, index === 0 ? "player status" : "player info")));
		if (mamesosuApi.every((response) => response.ok)) {
			const [
				playerStatusApi,
				playerInfoApi
			] = await Promise.all<[Promise<PlayerStatusApi>, Promise<PlayerInfoApi>]>([
				mamesosuApi.at(0)!.json(), // playerStatusApi
				mamesosuApi.at(1)!.json() // playerInfoApi
			]);
			const playerStatus = playerStatusApi.player_status,
				playerInfo = playerInfoApi.player.info;
			try {
				const [
					joinedClan,
					setBadge,
					mutual,
					following,
					followers
				] = await Promise.all([
					executeQuery<{ tag: string }>(userJoinedClanQuery, [playerInfo.clan_id]), // tag
					executeQuery<{ badge_id: number }>(setBadgeQuery, [id]), // setBadge
					executeQuery<ProfileConnection>(mutualQuery, [id]), // mutual
					executeQuery<ProfileConnection>(followingQuery, [id]), // following
					executeQuery<ProfileConnection>(followersQuery, [id]) // followers
				]);
				info = {
					tag: joinedClan.at(0)?.tag ?? null,
					name: playerInfo.name,
					pastNames: playerInfo.past_name,
					showPastName: playerInfo.show_past_name === 1,
					setBadge: setBadge.at(0)!.badge_id,
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
					isPrivate: playerInfo.private === 1
				};
			}
			catch (err) {
				void writeError(err);
				throw new Error("Couldn't get user info");
			}
		}
		else {
			let errMsg: string = "";
			mamesosuApi.forEach((response, i) => {
				if (!response.ok) {
					switch (i) {
						case 0: errMsg += `Couldn't fetch player status (status: ${response.status})\n`; break;
						case 1: errMsg += `Couldn't fetch player info (status: ${response.status})\n`; break;
					}
					void writeError(`${response.status}: ${response.statusText} (url: ${apiUrl[i]})`);
				}
			});
			throw new Error(errMsg);
		}
	}
	else {
		type ClanInfo = {
			tag: string,
			past_tag: string | null,
			show_past_tag: 0 | 1,
			created_at: number, // unix timestamp
			preferred_mode: ModeNum,
			userpage_content: string,
			public: 0 | 1,
			owner: number
		};

		try {
			const clanInfo = (await executeQuery<ClanInfo>(clanInfoQuery, [id])).at(0)!;
			info = {
				tag: null,
				name: clanInfo.tag,
				pastNames: clanInfo.past_tag,
				showPastName: clanInfo.show_past_tag === 1,
				setBadge: 0,
				country: "",
				creationTime: new Date(clanInfo.created_at * 1000),
				latestActivity: new Date(),
				priv: [],
				mutual: [],
				following: [],
				followers: [],
				preferredMode: clanInfo.preferred_mode,
				userpageContent: clanInfo.userpage_content,
				ownerId: clanInfo.owner,
				isOnline: false,
				isPrivate: clanInfo.public === 0
			};
		}
		catch (err) {
			void writeError(err);
			throw new Error("Couldn't get clan info");
		}
	}
	return info;
}

export type ClanMember = {
	id: number,
	name: string,
	country: string,
	privileges: Priv[],
	isOwner: 0 | 1,
	acc: number,
	plays: number,
	pp: number,
	score: number
};

export const getClanMembers = async (clanId: number, mode: ModeNum, isDans: boolean) => {
	try {
		type ClanMemberRow = Omit<ClanMember, "privileges"> & { priv: number };
		const members = !isDans
			? await executeQuery<ClanMemberRow>(clanMembersQuery, [mode, clanId])
			: await executeQuery<ClanMemberRow>(clanMembersDansQuery, [mode, mode, mode, clanId]);
		return members.map(({ priv, ...member }) => ({ ...member, privileges: getPrivs(priv) }));
	}
	catch (err) {
		void writeError(err);
		throw new Error("Couldn't get clan members");
	}
}

/* player scores */
export enum ScoreScope {
	bestPP,
	firstPlace,
	mostPlayed,
	recentPlayed
}

export type PlayerScoreMap = {
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
				}
				catch (err) {
					void writeError(err);
					throw new Error("Couldn't get first place maps");
				}
				break;
		}
	}
	else {
		try {
			switch (scope) {
				case ScoreScope.bestPP: playerScores = await executeQuery<PlayerScoreMap>(dansBestPPQuery, [id, mode]); break;
				case ScoreScope.firstPlace: playerScores = await executeQuery<PlayerScoreMap>(dansFirstPlaceQuery, [id, mode]); break;
				case ScoreScope.recentPlayed: playerScores = await executeQuery<PlayerScoreMap>(dansRecentPlayedQuery, [id, mode]); break;
			}
		}
		catch (err) {
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
		}
		catch (err) {
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

type PlayerStatistics = {
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
		const mamesosuApi = await fetchProfileResponse(apiUrl, "player statistics");
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
				let osudailyApi: Response | null = null;
				if (mode <= ModeNum.mania)
					osudailyApi = await fetchProfileResponse(osudailyApiUrl, "Bancho rank");
				if (osudailyApi === null || osudailyApi.ok) {
					const banchoRank = (await osudailyApi?.json() as { rank: number })?.rank ?? 0;
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
					void writeError(`${osudailyApi.status}: ${osudailyApi.statusText} (url: ${osudailyApiUrl})`);
					throw new Error(`Couldn't fetch bancho rank (status: ${osudailyApi.status})`);
				}
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
		let // rank: Rank,
			gradeCount: GradeCount,
			pp: PP,
			acc: number,
			playtime: PlayTime,
			plays: number,
			totalHits: number,
			rankedScore: number,
			totalScore: number,
			maxCombo: number,
			replaysWatched: number;
		const rank = { // TODO
			global: 0,
			country: 0,
			bancho: 0
		};
		const p = 10;
		if (!isDans) {
			type SimpleAggregate = {
				playtime: number,
				xh_count: number,
				x_count: number,
				sh_count: number,
				s_count: number,
				a_count: number,
				total_hits: number,
				max_combo: number,
				replay_views: number
			};
			type ComplexAggregate = {
				pp: number,
				pp_4k: number,
				pp_6k: number,
				pp_7k: number,
				pp_10k: number,
				acc: number,
				plays: number,
				rscore: number,
				tscore: number,
			};

			try {
				const [
					simpleAgg,
					complexAgg
				] = await Promise.all([
					executeQuery<SimpleAggregate>(clanStatsSimpleAggQuery, [id, mode]), // simpleAgg (1 record)
					executeQuery<ComplexAggregate>(clanStatsComplexAggQuery, [id, mode]) // complexAgg
				]);
				/* simple aggregate */
				playtime = getPlayTimeDHS(simpleAgg.at(0)?.playtime ?? 0);
				gradeCount = {
					xh: simpleAgg.at(0)?.xh_count ?? 0,
					x: simpleAgg.at(0)?.x_count ?? 0,
					sh: simpleAgg.at(0)?.sh_count ?? 0,
					s: simpleAgg.at(0)?.s_count ?? 0,
					a: simpleAgg.at(0)?.a_count ?? 0
				};
				totalHits = simpleAgg.at(0)?.total_hits ?? 0;
				maxCombo = simpleAgg.at(0)?.max_combo ?? 0;
				replaysWatched = simpleAgg.at(0)?.replay_views ?? 0;
				/* complex aggregate */
				pp = {
					default: generalizedMean(complexAgg.map(({ pp }) => pp), p),
					k4: generalizedMean(complexAgg.map(({ pp_4k }) => pp_4k), p),
					k6: generalizedMean(complexAgg.map(({ pp_6k }) => pp_6k), p),
					k7: generalizedMean(complexAgg.map(({ pp_7k }) => pp_7k), p),
					k10: generalizedMean(complexAgg.map(({ pp_10k }) => pp_10k), p),
				};
				acc = generalizedMean(complexAgg.map(({ acc }) => acc), p);
				plays = generalizedMean(complexAgg.map(({ plays }) => plays), p);
				rankedScore = generalizedMean(complexAgg.map(({ rscore }) => rscore), p);
				totalScore = generalizedMean(complexAgg.map(({ tscore }) => tscore), p);
			} catch (err) {
				void writeError(err);
				throw new Error("Couldn't get clan statistics");
			}
		}
		else {
			playtime = { days: 0, hours: 0, minutes: 0 };
			totalHits = 0;
			rankedScore = 0;
			totalScore = 0;
			replaysWatched = 0;
			try {
				const [
					danGradeCount,
					danMaxCombo,
					danComplexAgg,
					maniaDanReward
				] = await Promise.all([
					executeQuery<{
						grade: "XH" | "X" | "SH" | "S" | "A",
						count: number
					}>(clanDanGradeCountQuery, [id, mode]), // danGradeCount
					executeQuery<{ combo: number }>(clanDanMaxComboQuery, [id, mode]), // danMaxCombo
					executeQuery<{
						acc: number,
						plays: number,
						pp: number
					}>(clanDanRewardAccPlaysQuery, [id, mode, id, mode]), // danComplexAgg
					executeQuery<{ cs: 4 | 6 | 7 | 10, pp: number }>(clanManiaDanPPQuery, [id]), // maniaDanReward
				]);
				/* simple aggregate */
				gradeCount = {
					xh: danGradeCount.find(({ grade }) => grade === "XH")?.count ?? 0,
					x: danGradeCount.find(({ grade }) => grade === "X")?.count ?? 0,
					sh: danGradeCount.find(({ grade }) => grade === "SH")?.count ?? 0,
					s: danGradeCount.find(({ grade }) => grade === "S")?.count ?? 0,
					a: danGradeCount.find(({ grade }) => grade === "A")?.count ?? 0
				};
				maxCombo = danMaxCombo.at(0)!.combo;
				/* complex aggregate */
				pp = {
					default: generalizedMean(danComplexAgg.map(({ pp }) => pp), p),
					k4: generalizedMean(maniaDanReward.filter(({ cs }) => cs === 4).map(({ pp }) => pp), p),
					k6: generalizedMean(maniaDanReward.filter(({ cs }) => cs === 6).map(({ pp }) => pp), p),
					k7: generalizedMean(maniaDanReward.filter(({ cs }) => cs === 7).map(({ pp }) => pp), p),
					k10: generalizedMean(maniaDanReward.filter(({ cs }) => cs === 10).map(({ pp }) => pp), p)
				};
				acc = generalizedMean(danComplexAgg.map(({ acc }) => acc), p);
				plays = generalizedMean(danComplexAgg.map(({ plays }) => plays), p);
			} catch (err) {
				void writeError(err);
				throw new Error("Couldn't get clan dan statistics");
			}
		}
		statistics = {
			rank,
			playtime,
			gradeCount,
			pp,
			acc,
			plays,
			totalHits,
			rankedScore,
			totalScore,
			maxCombo,
			replaysWatched
		};
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
			skill: skillMedals.map(({ isCollected, ...rest}) =>
				({ ...rest, isCollected: Boolean(isCollected)})),
			mod: modMedals.map(({ isCollected, ...rest}) =>
				({ ...rest, isCollected: Boolean(isCollected)})),
			others: otherMedals.map(({ isCollected, ...rest}) =>
				({ ...rest, isCollected: Boolean(isCollected)}))
		}
	} catch (err) {
		void writeError(err);
		throw new Error("Couldn't get achievements");
	}
}
