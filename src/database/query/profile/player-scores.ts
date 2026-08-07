import { Priv } from "@/lib/priv";
import { ModNum } from "@/lib/mods";
import { ModeNum } from "@/lib/mode";

export const firstPlaceMapsQuery = `
    SELECT set_id, m.id, grade, title, artist, version, creator, m.status, mods, acc, pp
		FROM scores s
	JOIN maps m
		ON map_md5 = md5
    WHERE NOT grade IN ('F', 'N')
		AND NOT s.status = 0
		AND deleted = 0
		AND set_id > 0
		AND m.id > 0
		AND userid = ? -- number
		AND s.mode = ? -- ModeNum
		AND score = (
			SELECT MAX(score)
				FROM scores AS s_sub
			JOIN users u
				ON s_sub.userid = u.id
			WHERE s_sub.map_md5 = s.map_md5
				AND NOT s_sub.grade IN ('F', 'N')
				AND NOT s_sub.status = 0
				AND s_sub.deleted = 0
				AND (priv & ${Priv.unrestricted}) > 0
	    )
    ORDER BY pp DESC;
`;

export const dansBestPPQuery = `
	SELECT ANY_VALUE(set_id) AS set_id,
	       m.id,
	       ANY_VALUE(grade) AS grade,
	       ANY_VALUE(title) AS title,
	       ANY_VALUE(artist) AS artist,
	       ANY_VALUE(version) AS version,
           ANY_VALUE(creator) AS creator,
	       ANY_VALUE(s.mods) AS mods,
	       ANY_VALUE(s.acc) AS acc,
	       MAX(reward) AS pp
	    FROM scores s
	JOIN danmaps d
	    ON map_md5 = d.md5
	JOIN maps m
	    ON d.md5 = m.md5
        AND s.mode = d.mode
    WHERE NOT grade IN ('F', 'N')
		AND NOT s.status = 0
		AND deleted = 0
		AND (d.mods = ${ModNum.nm} OR (s.mods & d.mods) > 0)
		AND (s.mode = ${ModeNum.ctb} OR (s.mods & ${ModNum.nf}) = 0)
		AND (s.mods & (${ModNum.ez} | ${ModNum.ht} | ${ModNum.rd})) = 0
		AND s.acc >= d.acc
		AND s.score >= d.score
		AND s.max_combo >= pass_combo
		AND (NOT s.mode = ${ModeNum.std} OR nmiss <= pass_miss)
	    AND userid = ? -- number
	    AND s.mode = ? -- ModeNum
	GROUP BY m.id
	ORDER BY pp DESC
	LIMIT 100;
`;

export const dansFirstPlaceQuery = `
	SELECT set_id, m.id, grade, title, artist, version, s.mods, s.acc, reward AS pp
	    FROM scores s
	JOIN danmaps d
	    ON map_md5 = d.md5
        AND s.mode = d.mode
	JOIN maps m
	    ON d.md5 = m.md5
    WHERE NOT grade IN ('F', 'N')
		AND NOT s.status = 0
		AND deleted = 0
		AND (d.mods = ${ModNum.nm} OR (s.mods & d.mods) > 0)
		AND (s.mode = ${ModeNum.ctb} OR (s.mods & ${ModNum.nf}) = 0)
		AND (s.mods & (${ModNum.ez} | ${ModNum.ht} | ${ModNum.rd})) = 0
		AND s.acc >= d.acc
		AND s.score >= d.score
		AND s.max_combo >= pass_combo
		AND (NOT s.mode = ${ModeNum.std} OR nmiss <= pass_miss)
	    AND userid = ? -- number
	    AND s.mode = ? -- ModeNum
	    AND s.score = (
	        SELECT MAX(score)
	            FROM scores AS s_sub
	        JOIN users u
	            ON s_sub.userid = u.id
            WHERE s_sub.map_md5 = s.map_md5
				AND s_sub.mode = d.mode
				AND NOT grade IN ('F', 'N')
				AND NOT s_sub.status = 0
				AND deleted = 0
				AND (priv & ${Priv.unrestricted}) > 0
				AND (d.mods = ${ModNum.nm} OR (s_sub.mods & d.mods) > 0)
				AND (s_sub.mode = ${ModeNum.ctb} OR (s_sub.mods & ${ModNum.nf}) = 0)
				AND (s_sub.mods & (${ModNum.ez} | ${ModNum.ht} | ${ModNum.rd})) = 0
				AND s_sub.acc >= d.acc
				AND s_sub.score >= d.score
				AND s_sub.max_combo >= pass_combo
				AND (NOT s_sub.mode = ${ModeNum.std} OR nmiss <= pass_miss)
	    )
	ORDER BY reward DESC
`;

export const dansMostPlayedQuery = `
	SELECT m.id,
	       ANY_VALUE(set_id) AS set_id,
	       ANY_VALUE(title) AS title,
	       ANY_VALUE(artist) AS artist,
	       ANY_VALUE(version) AS version,
	       ANY_VALUE(creator) AS creator,
	       COUNT(*) AS plays
	    FROM scores s
	JOIN danmaps d
	    ON map_md5 = d.md5
	JOIN maps m
	    ON d.md5 = m.md5
	WHERE deleted = 0
	    AND userid = ? -- number
	    AND s.mode = ? -- ModeNum
	GROUP BY m.id
	ORDER BY plays DESC
`;

export const dansRecentPlayedQuery = `
	SELECT set_id, m.id, grade, title, artist, version, creator, m.status, s.mods, s.acc, reward AS pp
	    FROM scores s
	JOIN danmaps d
	    ON map_md5 = d.md5
	JOIN maps m
	    ON d.md5 = m.md5
	WHERE deleted = 0
	    AND TIMEDIFF(CURRENT_TIMESTAMP(), play_time) <= '24:00:00'
	    AND userid = ? -- number
	    AND s.mode = ? -- ModeNum
	ORDER BY play_time DESC
`;
