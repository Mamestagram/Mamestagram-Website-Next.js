import { Priv } from "@/lib/priv";

export const countryRankingQuery = `
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
`;