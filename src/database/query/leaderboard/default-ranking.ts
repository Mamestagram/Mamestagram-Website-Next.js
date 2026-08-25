import { Priv } from "@/lib/priv";
import { ModeNum } from "@/lib/mode";
import { ModNum } from "@/lib/mods";

export const defaultRankingQuery = (isDans: boolean, sortByOrder: string[]): Readonly<string> => !isDans
	? `
        SELECT u.id,
               RANK() OVER (ORDER BY ${sortByOrder}) 'rank',
               country,
               tag,
               u.name,
		       COALESCE(u.\`private\`, 0) AS isPrivate,
               acc,
               plays,
               pp,
               rscore AS score,
               xh_count + x_count AS xCount,
               sh_count + s_count AS sCount,
               a_count AS aCount
        	FROM users u
		JOIN stats s
			ON u.id = s.id
		LEFT JOIN clans c
			ON clan_id = c.id
        WHERE NOT u.id = 1
			AND (priv & ${Priv.unrestricted}) > 0
			AND NOT acc = 0
			AND mode = ? -- ModeNum
        ORDER BY ${sortByOrder}
	`
	: `
            WITH dan_acc_plays AS (SELECT userid, s.mode, AVG(s.acc) AS acc, COUNT(*) AS plays
                                   FROM scores s
                                            JOIN danmaps d
                                                 ON map_md5 = md5
                                                     AND s.mode = d.mode
                                   WHERE NOT grade IN ('F', 'N')
                                     AND NOT status = 0
                                     AND deleted = 0
                                     AND (d.mods = ${ModNum.nm} OR (s.mods & d.mods) > 0)
                                     AND (s.mode = ${ModeNum.ctb} OR (s.mods & ${ModNum.nf}) = 0)
                                     AND (s.mods & (${ModNum.ez} | ${ModNum.ht} | ${ModNum.rd})) = 0
                                     AND s.acc >= d.acc
                                     AND s.score >= d.score
                                     AND max_combo >= pass_combo
                                     AND (NOT s.mode = ${ModeNum.std} OR nmiss <= pass_miss)
                                   GROUP BY userid, s.mode)
            SELECT d_s.id,
                   RANK() OVER (ORDER BY SUM(reward_pp) DESC, acc DESC, plays DESC) 'rank',
                   ANY_VALUE(country)                    AS                         country,
                   ANY_VALUE(tag)                        AS                         tag,
                   ANY_VALUE(u.name)                     AS                         name,
                   ANY_VALUE(COALESCE(u.\`private\`, 0)) AS                         isPrivate,
                   ANY_VALUE(acc)                        AS                         acc,
                   ANY_VALUE(plays)                      AS                         plays,
                   SUM(reward_pp)                        AS                         pp
            FROM dan_stats d_s
                     JOIN dan_acc_plays d_a_p
                          ON d_s.id = userid
                              AND d_s.mode = d_a_p.mode
                     JOIN users u
                          ON d_s.id = u.id
                     LEFT JOIN clans c
                               ON clan_id = c.id
            WHERE NOT u.id = 1
              AND (priv & ${Priv.unrestricted}) > 0
              AND d_s.mode = ? -- ModeNum
            GROUP BY d_s.id
            ORDER BY pp DESC, acc DESC, plays DESC
	`;
