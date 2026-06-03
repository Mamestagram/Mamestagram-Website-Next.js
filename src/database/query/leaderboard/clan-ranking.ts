import { Priv } from "@/lib/priv";
import { ModeNum } from "@/lib/mode";
import { ModNum } from "@/lib/mods";

export const clanRankingQuery = (isDans: boolean, sortByOrder: string[]) => !isDans
	? `
	    SELECT clan_id AS id,
	           RANK() OVER (ORDER BY ${sortByOrder}) 'rank',
               ANY_VALUE(tag) AS tag,
	           AVG(acc) AS acc,
	           AVG(plays) AS plays,
	           AVG(pp) AS pp,
	           AVG(rscore) AS score,
	           AVG(xh_count + x_count) AS xCount,
	           AVG(sh_count + s_count) AS sCount,
	           AVG(a_count) AS aCount
	    	FROM stats s
		JOIN users u
			ON s.id = u.id
		JOIN clans c
			ON clan_id = c.id
	    WHERE public = 1
			AND (priv & ${Priv.unrestricted}) > 0
			AND NOT acc = 0
			AND mode = ? -- ModeNum
	    GROUP BY clan_id
	    ORDER BY ${sortByOrder}
	`
	: `
		WITH dan_acc_plays AS (
		    SELECT userid, s.mode, AVG(s.acc) AS acc, COUNT(*) AS plays
		        FROM scores s
		    JOIN danmaps d
		        ON map_md5 = md5
		        AND s.mode = d.mode
            WHERE NOT grade = 'F'
				AND NOT status = 0
				AND deleted = 0
				AND (d.mods = ${ModNum.nm} OR (s.mods & d.mods) > 0)
				AND (s.mode = ${ModeNum.ctb} OR (s.mods & ${ModNum.nf}) = 0)
				AND (s.mods & (${ModNum.ez} | ${ModNum.ht} | ${ModNum.rd})) = 0
				AND s.acc >= d.acc
				AND s.score >= d.score
				AND max_combo >= pass_combo
				AND (NOT s.mode = ${ModeNum.std} OR nmiss <= pass_miss)
		    GROUP BY userid, s.mode
		), dan_pp AS (
		    SELECT d_s.id, mode, ANY_VALUE(clan_id) AS clan_id, SUM(reward_pp) AS pp
		        FROM dan_stats d_s
		    JOIN users u
		        ON d_s.id = u.id
		    WHERE NOT u.id = 1
		        AND (priv & ${Priv.unrestricted}) > 0
		    GROUP BY d_s.id, mode
		)
		SELECT c.id,
		       RANK() OVER (ORDER BY AVG(pp) DESC, AVG(acc) DESC, AVG(plays) DESC) 'rank',
		       ANY_VALUE(tag) AS tag,
		       AVG(acc) AS acc,
		       AVG(plays) AS plays,
		       AVG(pp) AS pp
		    FROM dan_acc_plays d_a_p
		JOIN dan_pp d_p
		    ON userid = id
		    AND d_a_p.mode = d_p.mode
		JOIN clans c
		    ON clan_id = c.id
		WHERE d_a_p.mode = ? -- ModeNum
		GROUP BY clan_id
		ORDER BY pp DESC, acc DESC, plays DESC
	`;