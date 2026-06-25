import { Priv } from "@/lib/priv";
import { ModeNum } from "@/lib/mode";
import { ModNum } from "@/lib/mods";

export const clanUsersStatsQuery = `
	SELECT clan_id, tag, acc, plays, pp, rscore, xh_count + x_count AS xCount, sh_count + s_count AS sCount, a_count AS aCount
	    FROM stats s
	JOIN users u
	    ON s.id = u.id
	JOIN clans c
	    ON clan_id = c.id
	WHERE public = 1
	    AND (priv & ${Priv.unrestricted}) > 0
	    AND NOT acc = 0
	    AND mode = ? -- ModeNum
	ORDER BY clan_id
`;

export const clanUsersDanStatsQuery = `
	WITH dan_acc_plays AS (
	    SELECT userid, AVG(s.acc) AS acc, COUNT(*) AS plays
	        FROM scores s
	    JOIN users u
	        ON userid = u.id
	    JOIN danmaps d
	        ON map_md5 = md5
	        AND s.mode = d.mode
	    WHERE NOT grade IN ('F', 'N')
	        AND NOT status = 0
	        AND deleted = 0
	        AND (priv & ${Priv.unrestricted}) > 0
	        AND (d.mods = ${ModNum.nm} OR (s.mods & d.mods) > 0)
	        AND (s.mode = ${ModeNum.ctb} OR (s.mods & ${ModNum.nf}) = 0)
	        AND (s.mods & (${ModNum.ez} | ${ModNum.ht} | ${ModNum.rd})) = 0
	        AND s.acc >= d.acc
	        AND s.score >= d.score
	        AND max_combo >= pass_combo
	        AND (NOT s.mode = ${ModeNum.std} OR nmiss <= pass_miss)
	        AND s.mode = ? -- ModeNum
	    GROUP BY userid
	), dan_pp AS (
	    SELECT clan_id, d_s.id, SUM(reward_pp) AS pp
	        FROM dan_stats d_s
	    JOIN users u
	        ON d_s.id = u.id
	    WHERE NOT d_s.id = 1
	        AND (priv & ${Priv.unrestricted}) > 0
	        AND mode = ? -- ModeNum
	    GROUP BY id
	)
	SELECT clan_id, tag, acc, plays, pp
	    FROM dan_pp d_pp
	JOIN dan_acc_plays d_a_p
	    ON d_pp.id = d_a_p.userid
	JOIN clans c
	    ON clan_id = c.id
	ORDER BY clan_id
`;