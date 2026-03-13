export const sqlQuery = `
	SELECT u.id AS userId,
	       RANK() OVER(ORDER BY ? DESC) 'rank',
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
	    FROM users u
	JOIN stats s
	    ON u.id = s.id
	LEFT JOIN clans c
	    ON clan_id = c.id
	WHERE mode = ?
	    AND NOT u.id = 1
	    AND NOT acc = 0
	    AND (priv & ?) > 0
	ORDER BY ? DESC
	LIMIT 50;
`;