import { Priv } from "@/lib/priv";

export const beatmapDifficultiesQuery = `
	SELECT id, set_id, version, mode, diff, cs
		FROM maps
	WHERE set_id = ?
		AND server = ?
	ORDER BY mode, diff, id
`;

export const scoreCountriesQuery = (userCount: number) => {
	const placeholders = Array.from({ length: userCount }, () => "?").join(", ");
	return `SELECT id, country FROM users WHERE id IN (${placeholders})`;
};

export const privateProfileUserIdsQuery = (userCount: number) => {
	const placeholders = Array.from({ length: userCount }, () => "?").join(", ");
	return `SELECT id FROM users WHERE id IN (${placeholders}) AND COALESCE(\`private\`, 0) = 1`;
};

export const beatmapScoreIdsQuery = (scoreCount: number) => {
	const scoreFilters = Array.from({ length: scoreCount }, () => `(
		s.userid = ?
		AND s.score = ?
		AND s.mods = ?
		AND s.play_time = ?
	)`).join(" OR ");
	return `
		SELECT s.id,
		       s.userid AS userId,
		       s.score,
		       s.mods,
		       DATE_FORMAT(s.play_time, '%Y-%m-%dT%H:%i:%s') AS playTime
			FROM scores s
		WHERE s.map_md5 = ?
			AND s.mode = ?
			AND s.deleted = 0
			AND (${scoreFilters})
		ORDER BY s.id DESC
	`;
};

export const beatmapUserScoreQuery = `
	SELECT s.id,
	       s.userid AS userId,
	       u.name,
	       u.country,
	       s.score,
	       COALESCE(s.pp, 0) AS pp,
	       s.acc AS accuracy,
	       s.max_combo AS maxCombo,
	       s.mods,
	       s.n300,
	       s.n100,
	       s.n50,
	       s.nmiss AS nMiss,
	       s.ngeki AS nGeki,
	       s.nkatu AS nKatu,
	       s.grade,
	       s.play_time AS playTime
		FROM scores s
	JOIN users u
		ON u.id = s.userid
	WHERE s.map_md5 = ?
		AND s.mode = ?
		AND s.userid = ?
		AND s.deleted = 0
		AND s.status <> 0
		AND s.grade NOT IN ('F', 'N')
	ORDER BY s.score DESC, s.id DESC
	LIMIT 1
`;

export const beatmapUserRankQuery = `
	SELECT COUNT(*) AS higherScores
		FROM (
			SELECT s_rank.userid
				FROM scores s_rank
			JOIN users u_rank
				ON u_rank.id = s_rank.userid
			WHERE s_rank.map_md5 = ?
				AND s_rank.mode = ?
				AND s_rank.deleted = 0
				AND s_rank.status <> 0
				AND s_rank.grade NOT IN ('F', 'N')
				AND (u_rank.priv & ${Priv.unrestricted}) > 0
			GROUP BY s_rank.userid
			HAVING MAX(s_rank.score) > ?
		) ranked_scores
`;
