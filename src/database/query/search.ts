import { Priv } from "@/lib/priv";

export const userSearchQuery = `
	SELECT id, name, country, preferred_mode, priv
		FROM users
	WHERE id >= 3
		AND (priv & ${Priv.unrestricted}) > 0
		AND (id = ? OR safe_name LIKE ?)
	ORDER BY CASE
		WHEN id = ? THEN 0
		WHEN safe_name = ? THEN 1
		WHEN safe_name LIKE ? THEN 2
		ELSE 3
	END,
	id ASC
	LIMIT ? OFFSET ?
`;

export const userSearchCountQuery = `
	SELECT COUNT(*) AS total
		FROM users
	WHERE id >= 3
		AND (priv & ${Priv.unrestricted}) > 0
		AND (id = ? OR safe_name LIKE ?)
`;

export const clanSearchQuery = `
	SELECT c.id,
	       c.name,
	       c.tag,
	       c.preferred_mode,
	       COUNT(u.id) AS member_count
		FROM clans c
	LEFT JOIN users u
		ON u.clan_id = c.id
	WHERE c.id = ?
		OR c.tag LIKE ?
		OR c.name LIKE ?
	GROUP BY c.id, c.name, c.tag, c.preferred_mode
	ORDER BY CASE
		WHEN c.id = ? THEN 0
		WHEN c.tag = ? THEN 1
		WHEN c.name = ? THEN 2
		WHEN c.tag LIKE ? THEN 3
		WHEN c.name LIKE ? THEN 4
		ELSE 5
	END,
	c.id ASC
	LIMIT ? OFFSET ?
`;

export const clanSearchCountQuery = `
	SELECT COUNT(*) AS total
		FROM clans
	WHERE id = ?
		OR tag LIKE ?
		OR name LIKE ?
`;

export const beatmapSearchQuery = `
	SELECT id,
	       set_id,
	       status,
	       artist,
	       title,
	       version,
	       creator,
	       mode,
	       diff
		FROM maps
	WHERE server = 'osu!'
		AND (
			id = ?
			OR set_id = ?
			OR artist LIKE ?
			OR title LIKE ?
			OR version LIKE ?
			OR creator LIKE ?
		)
	ORDER BY CASE
		WHEN id = ? THEN 0
		WHEN set_id = ? THEN 1
		WHEN title = ? THEN 2
		WHEN title LIKE ? THEN 3
		WHEN artist LIKE ? THEN 4
		WHEN creator LIKE ? THEN 5
		ELSE 6
	END,
	plays DESC,
	id ASC
	LIMIT ? OFFSET ?
`;

export const beatmapSearchCountQuery = `
	SELECT COUNT(*) AS total
		FROM maps
	WHERE server = 'osu!'
		AND (
			id = ?
			OR set_id = ?
			OR artist LIKE ?
			OR title LIKE ?
			OR version LIKE ?
			OR creator LIKE ?
		)
`;
