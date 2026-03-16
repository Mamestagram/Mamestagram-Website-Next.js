import { Priv } from "@/lib/priv";
import { ModeNum } from "@/lib/mode";
import { ModNum } from "@/lib/mods";

export const countryRankingQuery: { [key in "normal" | "dans"]: string } = {
	normal: `
	    SELECT u.id,
	           RANK() OVER(ORDER BY ? DESC) 'rank', -- ...SortBy[]
	           country,
	           tag,
	           u.name,
	           acc,
	           plays,
	           pp,
	           rscore AS score,
	           xh_count + x_count AS ssCount,
	           sh_count + s_count AS sCount,
	           a_count AS aCount
	    FROM stats s
		JOIN users u
			ON s.id = u.id
		LEFT JOIN clans c
		    ON clan_id = c.id
	    WHERE NOT u.id = 1
			AND (priv & ${Priv.unrestricted}) > 0
	        AND NOT acc = 0
	        AND mode = ? -- Mode
	        AND country = ? -- string
	    ORDER BY ? DESC -- ...SortBy[]
	`,
	dans: `
		WITH dan_acc_plays AS (
            SELECT userid, s.mode, AVG(s.acc) AS acc, COUNT(*) AS plays
            	FROM scores s
			JOIN danmaps d
				ON map_md5 = md5
				AND s.mode = d.mode
            WHERE NOT grade = 'F'
				AND deleted = 0
				AND status = 2
				AND IF(NOT d.mods = ${ModNum.nm}, (s.mods & d.mods) > 0, TRUE)
				AND IF(NOT s.mode = ${ModeNum.ctb}, (s.mods & ${ModNum.nf}) = 0, TRUE)
				AND (s.mods & (${ModNum.ez} | ${ModNum.ht} | ${ModNum.rd})) = 0
				AND s.acc >= d.acc
				AND s.score >= d.score
				AND max_combo >= pass_combo
				AND IF(s.mode = ${ModeNum.std}, nmiss <= pass_miss, TRUE)
            GROUP BY userid, s.mode
        )
		SELECT d_s.id,
		       RANK() OVER(ORDER BY SUM(reward_pp) DESC, acc DESC, plays DESC) 'rank',
		       ANY_VALUE(country) AS country,
		       ANY_VALUE(tag) AS tag,
		       ANY_VALUE(u.name) AS name,
		       ANY_VALUE(acc) AS acc,
		       ANY_VALUE(plays) AS plays,
		       SUM(reward_pp) AS pp
		    FROM dan_stats d_s
		JOIN dan_acc_plays d_a_p
		    ON d_s.id = userid
		    AND d_s.mode = d_a_p.mode
		JOIN users u
		    ON d_s.id = u.id
		LEFT JOIN clans c
		    ON clan_id = c.id
		WHERE NOT u.id = 1
		    AND (priv & 1 << ${Priv.unrestricted}) > 0
		    AND d_s.mode = ? -- Mode
			AND u.country = ? -- string
		GROUP BY d_s.id
		ORDER BY pp DESC, acc DESC, plays DESC
	`
};