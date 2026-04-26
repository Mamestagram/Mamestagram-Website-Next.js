import { executeQuery } from "./connect";
import { ModeNum, OsuMode } from "@/lib/mode";
import { Priv } from "@/lib/priv";

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

export const getInfo = async (id: number, isClan: boolean): UserInfo => {
	if (!isClan) {
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
		const mamesosuApi = await fetch(`https://api.${process.env.BASE_DOMAIN}/v1/get_player_info?id=${id}&scope=info`);
		const apiUserInfo = (await mamesosuApi.json() as ApiUserInfo).player.info;
		const [
			tag,
			{ past_name, show_past_name },
			mutual,
			following,
			followers
		] = [
			// tag
			(await executeQuery<{ tag: string }>(
				`
				SELECT tag
					from clans
				WHERE id = ?
				`,
				[apiUserInfo.clan_id]
			)).at(0)?.tag,
			// { past_name, show_past_name }
			(await executeQuery<{ past_name: string, show_past_name: 0 | 1 }>(
				`
				SELECT past_name,
				       show_pName AS show_past_name
				    from users
				WHERE id = ?
				`,
				[id]
			)).map(({ past_name, show_past_name }) => ({
				past_name: past_name.split(", "),
				show_past_name
			})).at(0)!,
			// mutual
			await executeQuery<{ user: number }>(
				`
                SELECT following.user2 AS user
                	FROM relationships following
				JOIN relationships followers
					ON followers.type = 'friend'
					AND following.user2 = followers.user1
					AND following.user1 = followers.user2
                WHERE following.type = 'friend'
					AND following.user1 = ?
                ORDER BY following.user2
				`,
				[id]
			),
			// following
			await executeQuery<{ user: number }>(
				`
				SELECT user2 AS user
				    FROM relationships following
				WHERE type = 'friend'
				    AND EXISTS(
				        SELECT *
				            FROM relationships followers
				        WHERE followers.type = 'friend'
				            AND followers.user1 = following.user2
				            AND followers.user2 = following.user1
				    ) = 0
				    AND user1 = ?
				ORDER BY user2
				`,
				[id]
			),
			// follower
			await executeQuery<{ user: number }>(
				`
				SELECT user1 AS user
				    FROM relationships followers
				WHERE type = 'friend'
				    AND EXISTS(
				        SELECT *
				            FROM relationships following
				        WHERE following.type = 'friend'
				            AND following.user1 = followers.user2
				            AND following.user2 = followers.user1
				    ) = 0
				    AND user2 = ?
				ORDER BY user1
				`,
				[id]
			)
		];
		return {
			tag,
			name: apiUserInfo.name,
			pastName: past_name,
			showPastName: show_past_name === 1,
			country: apiUserInfo.country,
			creationTime: new Date(apiUserInfo.creation_time * 1000),
			latestActivity: new Date(apiUserInfo.latest_activity * 1000),
		}
	}
	else {
	
	}
}