import { executeQuery } from "./connect";
import {
	otherUserInfoQuery,
	clanInfoQuery,
	mutualQuery,
	followingQuery,
	followersQuery
} from "./query/profile/user-info";
import { currentGoalQuery } from "@/database/query/profile/current-goal";
import { ModeNum, OsuMode } from "@/lib/mode";
import { Priv, getPrivs } from "@/lib/priv";
import { writeError } from "@/lib/log";

type ApiUserInfo = {
	player: {
		info: {
			name: string,
			priv: number,
			country: string,
			creation_time: number, // unix timestamp
			userpage_content: string,
			show_past_name: 0 | 1,
			past_name: string,
			latest_activity: number, // unix timestamp
			clan_id: number,
			preferred_mode: ModeNum,
			private: 0 | 1
		}
	}
};

type ClanInfo = {
	tag: string,
	past_tag: string | null,
	show_past_tag: 0 | 1,
	created_at: number, // unix timestamp
	preferred_mode: ModeNum,
	userpage_content: string,
	public: 0 | 1
};

export type Info = {
	tag?: string | undefined, // unused for clan pf
	name: string,
	pastName: string[] | null,
	showPastName: boolean,
	country?: string, // unused for clan pf
	creationTime: Date,
	latestActivity?: Date, // unused for clan pf
	priv?: Priv[], // unused for clan pf
	mutual?: { user: number }[], // unused for clan pf
	following?: { user: number }[], // unused for clan pf
	followers?: { user: number }[], // unused for clan pf
	preferredMode: ModeNum,
	userpageContent: string,
	isPrivate: boolean
};

type GoalInfo = {
	name: string,
	category: string,
	val: number
};

type CurrentGoal = Record<"pp" | "acc" | "score", GoalInfo | undefined>;

export const accountExists = async (id: number, isClan: boolean) => {
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

export const getPreferredMode = async (id: number, isClan: boolean) => {
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

export const getInfo = async (id: number, isClan: boolean) => {
	let info: Info;
	if (!isClan) {
		const mamesosuApi = await fetch(`https://api.${process.env.BASE_DOMAIN}/v1/get_player_info?id=${id}&scope=info`);
		if (mamesosuApi.ok) {
			const apiUserInfo = (await mamesosuApi.json() as ApiUserInfo).player.info;
			const [
				tag,
				mutual,
				following,
				followers
			] = [
				// tag
				(await executeQuery<{ tag: string }>(otherUserInfoQuery, [apiUserInfo.clan_id])).at(0)?.tag,
				// mutual
				await executeQuery<{ user: number }>(mutualQuery, [id]),
				// following
				await executeQuery<{ user: number }>(followingQuery, [id]),
				// followers
				await executeQuery<{ user: number }>(followersQuery, [id])
			];
			info = {
				tag,
				name: apiUserInfo.name,
				pastName: apiUserInfo.past_name.split(", "),
				showPastName: apiUserInfo.show_past_name === 1,
				country: apiUserInfo.country,
				creationTime: new Date(apiUserInfo.creation_time * 1000),
				latestActivity: new Date(apiUserInfo.latest_activity * 1000),
				priv: getPrivs(apiUserInfo.priv),
				mutual,
				following,
				followers,
				preferredMode: apiUserInfo.preferred_mode,
				userpageContent: apiUserInfo.userpage_content,
				isPrivate: apiUserInfo.private === 1
			};
		}
		else {
			writeError(`${mamesosuApi.status}: ${mamesosuApi.statusText}`).then();
			throw new Error(`Couldn't fetch api data (status: ${mamesosuApi.status})`);
		}
	}
	else {
		try {
			const clanInfo = (await executeQuery<ClanInfo>(clanInfoQuery, [id])).at(0)!;
			info = {
				name: clanInfo.tag,
				pastName: clanInfo.past_tag !== null ? clanInfo.past_tag.split(", ") : null,
				showPastName: clanInfo.show_past_tag === 1,
				creationTime: new Date(clanInfo.created_at * 1000),
				preferredMode: clanInfo.preferred_mode,
				userpageContent: clanInfo.userpage_content,
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

export const getCurrentGoal = async (id: number): Promise<CurrentGoal> => {
	try {
		return {
			pp: (await executeQuery<GoalInfo>(currentGoalQuery("pp"), [id])).at(0),
			acc: (await executeQuery<GoalInfo>(currentGoalQuery("acc"), [id])).at(0),
			score: (await executeQuery<GoalInfo>(currentGoalQuery("score"), [id])).at(0)
		};
	}
	catch (err) {
		writeError(err).then();
		throw new Error("Couldn't get current goal");
	}
}