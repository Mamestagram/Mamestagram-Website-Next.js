import { executeQuery } from "./connection";
import {
	userJoinedClanQuery,
	clanInfoQuery,
	setBadgeQuery,
	mutualQuery,
	followingQuery,
	followersQuery
} from "./query/profile/user-info";
import { currentGoalQuery } from "@/database/query/profile/current-goal";
import {
	dansBestPPQuery,
	dansFirstPlaceQuery,
	dansMostPlayedQuery,
	dansRecentPlayedQuery,
	firstPlaceMapsQuery
} from "@/database/query/profile/player-scores";
import {
	medalCountQuery,
	medalSkillQuery,
	medalModQuery,
	medalOthersQuery
} from "@/database/query/profile/statistics/achievements";
import {
	dansGradeCountQuery,
	dansPPQuery,
	maniaDansPPQuery,
	dansAccQuery,
	dansPlayCountQuery,
	dansMaxComboQuery
} from "@/database/query/profile/statistics/personal-dans";
import {
	clanStatsSimpleAggQuery,
	clanStatsComplexAggQuery,
	clanDanGradeCountQuery,
	clanDanMaxComboQuery,
	clanDanRewardAccPlaysQuery,
	clanManiaDanPPQuery
} from "@/database/query/profile/statistics/clan";
import { ModeNum, OsuMode } from "@/lib/mode";
import { getPrivs, Priv } from "@/lib/priv";
import { writeError } from "@/lib/log";
import { generalizedMean } from "@/lib/aggregate";

export const accountExists = async (id: number, isClan: boolean) => {
	try {
		// personal
		if (!isClan) {
			return (await executeQuery<{ user_exists: 0 | 1 }>(
				`
				SELECT EXISTS(
				    SELECT *
				        FROM users
				    WHERE id = ?
			    ) AS user_exists
				`,
				[id]
			)).at(0)!.user_exists === 1;
		}
		// clan
		else {
			return (await executeQuery<{ clan_exists: 0 | 1 }>(
				`
				SELECT EXISTS(
				    SELECT *
				        FROM clans
				    WHERE id = ?
			    ) AS clan_exists
				`,
				[id]
			)).at(0)!.clan_exists === 1;
		}
	}
	catch (err) {
		writeError(err).then();
		throw new Error(`Couldn't get ${!isClan ? "user" : "clan"} data`);
	}
}

export const getName = async (id: number, isClan: boolean) => {
	try {
		// personal
		if (!isClan) {
			return (await executeQuery<{ name: string }>(
				`
				SELECT name
					FROM users
				WHERE id = ?
				`,
				[id]
			)).at(0)!.name;
		}
		// clan
		else {
			return (await executeQuery<{ tag: string }>(
				`
				SELECT tag
					FROM clans
				WHERE id = ?
				`,
				[id]
			)).at(0)!.tag;
		}
	}
	catch (err) {
		writeError(err).then();
		throw new Error(`Couldn't get ${!isClan ? "user" : "clan"} data`);
	}
}

export const getPreferredMode = async (id: number, isClan: boolean) => {
	try {
		// presonal
		if (!isClan) {
			const preferredModeNum = (await executeQuery<{ preferred_mode: ModeNum }>(
				`
				SELECT preferred_mode
					FROM users
				WHERE id = ?
				`,
				[id]
			)).at(0)!.preferred_mode;
			return ModeNum[preferredModeNum] as OsuMode;
		}
		// clan
		else {
			const preferredModeNum = (await executeQuery<{ preferred_mode: ModeNum }>(
				`
				SELECT preferred_mode
					FROM clans
				WHERE id = ?
				`,
				[id]
			)).at(0)!.preferred_mode;
			return ModeNum[preferredModeNum] as OsuMode;
		}
	}
	catch (err) {
		writeError(err).then();
		throw new Error(`Couldn't get ${!isClan ? "user" : "clan"}`);
	}
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
	mutual: { user: number }[], // unused for clan pf
	following: { user: number }[], // unused for clan pf
	followers: { user: number }[], // unused for clan pf
	preferredMode: ModeNum,
	userpageContent: string | null,
	isOnline: boolean, // unused for clan pf
	isPrivate: boolean
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
		const apiUrl = [
			`https://api.${process.env.BASE_DOMAIN}/v1/get_player_status?id=${id}`, // player status
			`https://api.${process.env.BASE_DOMAIN}/v1/get_player_info?id=${id}&scope=info` // player info
		];
		const mamesosuApi = await Promise.all(apiUrl.map((url) => fetch(url)));
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
					executeQuery<{ user: number }>(mutualQuery, [id]), // mutual
					executeQuery<{ user: number }>(followingQuery, [id]), // following
					executeQuery<{ user: number }>(followersQuery, [id]) // followers
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
					isOnline: playerStatus.online,
					isPrivate: playerInfo.private === 1
				};
			}
			catch (err) {
				writeError(err).then();
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
					writeError(`${response.status}: ${response.statusText} (url: ${apiUrl[i]})`).then();
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
			public: 0 | 1
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
				isOnline: false,
				isPrivate: clanInfo.public === 0
			};
		}
		catch (err) {
			writeError(err).then();
			throw new Error("Couldn't get clan info");
		}
	}
	return info;
}

/* player scores */
export type ScoreScope = "bestPP" | "firstPlace" | "recentPlayed";

export const getPlayerScores = async (scope: ScoreScope, id: number, mode: ModeNum, isDans: boolean) => {
	type PlayerScoreMap = {
		set_id: number,
		id: number,
		grade: string,
		title: string,
		artist: string,
		version: string,
		creator: string,
		status: number,
		mods: number,
		acc: number,
		pp: number
	};
	
	let playerScores: PlayerScoreMap[] = [];
	if (!isDans) {
		if (scope === "bestPP" || scope === "recentPlayed") {
			type PlayerScoresApi = {
				scores: {
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
					}
				}[]
			};
			
			const apiUrl: { [key in Exclude<ScoreScope, "firstPlace">]: string } = {
				bestPP: `https://api.${process.env.BASE_DOMAIN}/v1/get_player_scores?id=${id}&scope=best&mode=${mode}&limit=100`,
				recentPlayed: `https://api.${process.env.BASE_DOMAIN}/v1/get_player_scores?id=${id}&scope=recent&mode=${mode}&limit=100`
			};
			let url: string;
			switch (scope) {
				case "bestPP": url = apiUrl.bestPP; break;
				case "recentPlayed": url = apiUrl.recentPlayed; break;
			}
			const mamesosuApi = await fetch(url);
			if (mamesosuApi.ok) {
				const bestPPApi = await mamesosuApi.json() as PlayerScoresApi;
				playerScores = bestPPApi.scores.map(
					(score) => ({
						set_id: score.beatmap.set_id,
						id: score.beatmap.id,
						grade: score.grade,
						title: score.beatmap.title,
						artist: score.beatmap.artist,
						version: score.beatmap.version,
						creator: score.beatmap.creator,
						status: score.beatmap.status,
						mods: score.mods,
						acc: score.acc,
						pp: score.pp
					})
				);
			}
			else {
				writeError(`${mamesosuApi.status}: ${mamesosuApi.statusText} (url: ${url})`).then();
				throw new Error(`Couldn't fetch ${scope} (status: ${mamesosuApi.status})\n`);
			}
		}
		else {
			try {
				playerScores = await executeQuery<PlayerScoreMap>(firstPlaceMapsQuery, [id, mode]);
			}
			catch (err) {
				writeError(err).then();
				throw new Error("Couldn't get first place maps");
			}
		}
	}
	else {
		try {
			switch (scope) {
				case "bestPP": playerScores = await executeQuery<PlayerScoreMap>(dansBestPPQuery, [id, mode]); break;
				case "firstPlace": playerScores = await executeQuery<PlayerScoreMap>(dansFirstPlaceQuery, [id, mode]); break;
				case "recentPlayed": playerScores = await executeQuery<PlayerScoreMap>(dansRecentPlayedQuery, [id, mode]); break;
			}
		}
		catch (err) {
			writeError(err).then();
			throw new Error(`Couldn't get ${scope}`);
		}
	}
	return playerScores;
}

export const getMostPlayedMaps = async (id: number, mode: ModeNum, isDans: boolean) => {
	type PlayerMostPlayedMap = {
		set_id: number,
		id: number,
		artist: string,
		title: string,
		version: string,
		creator: string,
		plays: number
	};
	
	let maps: PlayerMostPlayedMap[] = [];
	if (!isDans) {
		type PlayerMostPlayedApi = {
			maps: PlayerMostPlayedMap[],
		};
		
		const apiUrl = `https://api.${process.env.BASE_DOMAIN}/v1/get_player_most_played?id=${id}&mode=${mode}&limit=100`;
		const mamesosuApi = await fetch(apiUrl);
		if (mamesosuApi.ok) {
			maps = (await mamesosuApi.json() as PlayerMostPlayedApi).maps;
		}
		else {
			writeError(`${mamesosuApi.status}: ${mamesosuApi.statusText} (url: ${apiUrl})`).then();
			throw new Error(`Couldn't fetch most played maps (status: ${mamesosuApi.status})\n`);
		}
	}
	else {
		try {
			maps = await executeQuery<PlayerMostPlayedMap>(dansMostPlayedQuery, [id, mode]);
		}
		catch (err) {
			writeError(err).then();
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
type Medal = {
	userId: number,
	filename: string,
	name: string,
	description: string,
	condDescription: string
};
type Achievements = {
	count: number,
	medals: {
		skill: Medal[],
		mod: Medal[],
		others: Medal[]
	}
};
type PlayerStatistics = {
	rank: Rank,
	achievements: Achievements,
	playtime: number,
	gradeCount: GradeCount,
	pp: PP,
	acc: number,
	plays: number,
	totalHits: number,
	rankedScore: number,
	totalScore: number,
	maxCombo: number,
	replaysWatched: number
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
		
		const apiUrl = `https://api.${process.env.BASE_DOMAIN}/v1/get_player_info?id=${id}&scope=stats`;
		const mamesosuApi = await fetch(apiUrl);
		if (mamesosuApi.ok) {
			const playerStats = (await mamesosuApi.json() as PlayerStatsApi).player.stats[mode];
			const playtime = playerStats.playtime,
				totalHits = playerStats.total_hits,
				rankedScore = playerStats.rscore,
				totalScore = playerStats.tscore,
				replaysWatched = playerStats.replay_views;
			/* achievements */
			let rank: Rank,
				achievements: Achievements,
				gradeCount: GradeCount,
				pp: PP,
				acc: number,
				plays: number,
				maxCombo: number;
			try {
				const [
					medalCount,
					skillMedals,
					modMedals,
					otherMedals
				] = await Promise.all([
					executeQuery<{ value: number }>(medalCountQuery, [id]), // medalCount
					executeQuery<Medal>(medalSkillQuery(mode), [id], true), // skillMedals
					executeQuery<Medal>(medalModQuery, [id], true), // modMedals
					executeQuery<Medal>(medalOthersQuery, [id], true) // otherMedals
				]);
				achievements = {
					count: medalCount.at(0)!.value,
						medals: {
						skill: skillMedals,
						mod: modMedals,
						others: otherMedals
					}
				}
			}
			catch (err) {
				writeError(err).then();
				throw new Error("Couldn't get medals");
			}
			if (!isDans) {
				let osudailyApi: Response | null = null;
				if (mode <= ModeNum.mania)
					osudailyApi = await fetch(`https://osudaily.net/api/pp.php?k=${process.env.OSUDAILY_API_KEY}&v=${playerStats.pp}&t=pp&m=${mode}`);
				if (osudailyApi === null || osudailyApi.ok) {
					const banchoRank = (await osudailyApi?.json() as { rank: number }).rank ?? 0;
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
					writeError(`${osudailyApi.status}: ${osudailyApi.statusText}`).then();
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
						executeQuery<{ grade: "XH" | "X" | "SH" | "S" | "A", count: number }>(dansGradeCountQuery, [id, mode]), // gradeCounts
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
				}
				catch (err) {
					writeError(err).then();
					throw new Error("Couldn't get stats");
				}
			}
			statistics = {
				rank,
				achievements,
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
		else {
			writeError(`${mamesosuApi.status}: ${mamesosuApi.statusText} (url: ${apiUrl})`).then();
			throw new Error(`Couldn't fetch player statistics (status: ${mamesosuApi.status})`);
		}
	}
	else {
		let // rank: Rank,
			// achievements: Achievements,
			playtime: number,
			gradeCount: GradeCount,
			pp: PP,
			acc: number,
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
		const achievements = { // TODO
			count: 0,
			medals: {
				skill: [],
				mod: [],
				others: []
			}
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
				playtime = simpleAgg.at(0)?.playtime ?? 0;
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
			}
			catch (err) {
				writeError(err).then();
				throw new Error("Couldn't get clan statistics");
			}
		}
		else {
			playtime = 0;
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
					executeQuery<{ grade: "XH" | "X" | "SH" | "S" | "A", count: number }>(clanDanGradeCountQuery, [id, mode]), // danGradeCount
					executeQuery<{ combo: number }>(clanDanMaxComboQuery, [id, mode]), // danMaxCombo
					executeQuery<{ acc: number, plays: number, pp: number }>(clanDanRewardAccPlaysQuery, [id, mode, id, mode]), // danComplexAgg
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
			}
			catch (err) {
				writeError(err).then();
				throw new Error("Couldn't get clan dan statistics");
			}
		}
		statistics = {
			rank,
			achievements,
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