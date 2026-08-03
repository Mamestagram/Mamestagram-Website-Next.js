import { ModeNum } from "@/lib/mode";
import { ModNum } from "@/lib/mods";

export const clanMembersQuery = `
	SELECT u.id,
	       u.name,
	       u.country,
	       u.priv,
	       u.id = c.owner AS isOwner,
	       IFNULL(s.acc, 0) AS acc,
	       IFNULL(s.plays, 0) AS plays,
	       IFNULL(s.pp, 0) AS pp,
	       IFNULL(s.rscore, 0) AS score
		FROM users u
	JOIN clans c
		ON c.id = u.clan_id
	LEFT JOIN stats s
		ON s.id = u.id
		AND s.mode = ? -- ModeNum
	WHERE u.clan_id = ? -- number
		AND u.id >= 3
	ORDER BY isOwner DESC, pp DESC, u.name, u.id
`;

export const clanMembersDansQuery = `
	WITH dan_acc_plays AS (
		SELECT userid, AVG(s.acc) AS acc, COUNT(*) AS plays
			FROM scores s
		JOIN danmaps d
			ON s.map_md5 = d.md5
			AND s.mode = d.mode
		WHERE NOT s.grade IN ('F', 'N')
			AND NOT s.status = 0
			AND s.deleted = 0
			AND (d.mods = ${ModNum.nm} OR (s.mods & d.mods) > 0)
			AND (s.mode = ${ModeNum.ctb} OR (s.mods & ${ModNum.nf}) = 0)
			AND (s.mods & (${ModNum.ez} | ${ModNum.ht} | ${ModNum.rd})) = 0
			AND s.acc >= d.acc
			AND s.score >= d.score
			AND s.max_combo >= d.pass_combo
			AND (NOT s.mode = ${ModeNum.std} OR s.nmiss <= d.pass_miss)
			AND s.mode = ? -- ModeNum
		GROUP BY userid
	), dan_pp AS (
		SELECT id, SUM(reward_pp) AS pp
			FROM dan_stats
		WHERE mode = ? -- ModeNum
		GROUP BY id
	)
	SELECT u.id,
	       u.name,
	       u.country,
	       u.priv,
	       u.id = c.owner AS isOwner,
	       IFNULL(d_a_p.acc, 0) AS acc,
	       IFNULL(d_a_p.plays, 0) AS plays,
	       IFNULL(d_pp.pp, 0) AS pp,
	       IFNULL(s.rscore, 0) AS score
		FROM users u
	JOIN clans c
		ON c.id = u.clan_id
	LEFT JOIN stats s
		ON s.id = u.id
		AND s.mode = ? -- ModeNum
	LEFT JOIN dan_acc_plays d_a_p
		ON d_a_p.userid = u.id
	LEFT JOIN dan_pp d_pp
		ON d_pp.id = u.id
	WHERE u.clan_id = ? -- number
		AND u.id >= 3
	ORDER BY isOwner DESC, pp DESC, u.name, u.id
`;
