import { executeQuery } from "./connect";
import { mutualQuery, followingQuery, followersQuery, otherUserInfoQuery } from "./query/profile/user-info";
import { ModeNum, OsuMode } from "@/lib/mode";
import { Priv, getPrivs } from "@/lib/priv";

type ApiUserInfo = {
	player: {
		info: {
			name: string,
			priv: number,
			country: string,
			creation_time: number, // unix timestamp
			latest_activity: number, // unix timestamp
			clan_id: number,
			preferred_mode: ModeNum,
			private: 0 | 1
		}
	}
};

type UserInfo = {
	tag?: string,
	name: string,
	pastName: string[],
	showPastName: boolean,
	country: string,
	creationTime: Date,
	latestActivity: Date,
	priv: Priv[],
	mutual: { user: number }[], // unused for clan pf
	following: { user: number }[], // unused for clan pf
	followers: { user: number }[], // unused for clan pf
	preferredMode: ModeNum,
	isPrivate: boolean
};

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
	let info: UserInfo;
	if (!isClan) {
		const mamesosuApi = await fetch(`https://api.${process.env.BASE_DOMAIN}/v1/get_player_info?id=${id}&scope=info`);
		const apiUserInfo = (await mamesosuApi.json() as ApiUserInfo).player.info;
		const [
			{ tag, past_name, show_past_name },
			mutual,
			following,
			followers
		] = [
			// { tag, past_name, show_past_name }
			(await executeQuery<{
				tag: string,
				past_name: string,
				show_past_name: 0 | 1
			}>(
				otherUserInfoQuery,
				[id]
			)).map((row) => ({
				tag: row.tag,
				past_name: row.past_name.split(", "),
				show_past_name: row.show_past_name
			})).at(0)!,
			// mutual
			await executeQuery<{ user: number }>(
				mutualQuery,
				[id]
			),
			// following
			await executeQuery<{ user: number }>(
				followingQuery,
				[id]
			),
			// followers
			await executeQuery<{ user: number }>(
				followersQuery,
				[id]
			)
		];
		info = {
			tag,
			name: apiUserInfo.name,
			pastName: past_name,
			showPastName: show_past_name === 1,
			country: apiUserInfo.country,
			creationTime: new Date(apiUserInfo.creation_time * 1000),
			latestActivity: new Date(apiUserInfo.latest_activity * 1000),
			priv: getPrivs(apiUserInfo.priv),
			mutual,
			following,
			followers,
			preferredMode: apiUserInfo.preferred_mode,
			isPrivate: apiUserInfo.private === 1
		};
	}
	else {
	
	}
	return info;
}