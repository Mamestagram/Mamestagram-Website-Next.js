export const userByLoginQuery = `
	SELECT users.id,
	       users.clan_id,
	       users.priv,
	       users.name,
	       users.country,
	       users.pw_bcrypt
		FROM users
	WHERE users.safe_name = ?
		OR LOWER(users.email) = ?
	LIMIT 1
`;

export const userByIdQuery = `
	SELECT users.id,
	       users.clan_id,
	       users.priv,
	       users.name,
	       users.country,
	       users.pw_bcrypt
		FROM users
	WHERE users.id = ?
	LIMIT 1
`;

export const registrationConflictQuery = `
	SELECT safe_name, email
		FROM users
	WHERE safe_name = ?
		OR LOWER(email) = ?
	LIMIT 1
`;

export const latestUserIdForUpdateQuery = `
	SELECT id
		FROM users
	ORDER BY id DESC
	LIMIT 1
	FOR UPDATE
`;

export const createUserQuery = `
	INSERT INTO users (id, name, safe_name, email, pw_bcrypt, country, creation_time, latest_activity)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

export const deleteOrphanedStatsQuery = "DELETE FROM stats WHERE id = ?";

export const deleteOrphanedDanStatsQuery = "DELETE FROM dan_stats WHERE id = ?";

export const createStatsQuery = (modeCount: number) => {
	const placeholders = Array.from({ length: modeCount }, () => "(?, ?)").join(", ");
	return `INSERT INTO stats (id, mode) VALUES ${placeholders}`;
};

export const createDanStatsQuery = (rowCount: number) => {
	const placeholders = Array.from({ length: rowCount }, () => "(?, ?, ?, ?)").join(", ");
	return `INSERT INTO dan_stats (id, mode, type, cs) VALUES ${placeholders}`;
};
