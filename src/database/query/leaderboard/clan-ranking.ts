import { Priv } from "@/lib/priv";

export const clanRankingQuery = `
    SELECT clan_id AS id,
           RANK() OVER(ORDER BY ? DESC) 'rank', -- AVG(...SortBy[])
           tag,
           AVG(acc) AS acc,
           AVG(plays) AS plays,
           AVG(pp) AS pp,
           AVG(rscore) AS score,
           AVG(xh_count + x_count) AS ssCount,
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
		AND mode = ? -- Mode
    GROUP BY clan_id
    ORDER BY ? DESC -- AVG(...SortBy[])
`;