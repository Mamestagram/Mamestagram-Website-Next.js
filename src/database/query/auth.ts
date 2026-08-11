export const userByLoginQuery = `
	SELECT users.id,
	       users.clan_id,
	       users.priv,
	       users.name,
	       users.country,
	       users.pw_bcrypt,
	       market_badge_equipment.badge_id
		FROM users
	LEFT JOIN market_badge_equipment
		ON market_badge_equipment.owner_id = users.id
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
	       users.pw_bcrypt,
	       market_badge_equipment.badge_id
		FROM users
	LEFT JOIN market_badge_equipment
		ON market_badge_equipment.owner_id = users.id
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

export const createUserQuery = `
	INSERT INTO users (name, safe_name, email, pw_bcrypt, country, creation_time, latest_activity)
	VALUES (?, ?, ?, ?, ?, ?, ?)
`;

export const createStatsQuery = (modeCount: number) => {
	const placeholders = Array.from({ length: modeCount }, () => "(?, ?)").join(", ");
	return `INSERT INTO stats (id, mode) VALUES ${placeholders}`;
};

export const createGachaStatsQuery = "INSERT INTO gacha_stats (id) VALUES (?)";
