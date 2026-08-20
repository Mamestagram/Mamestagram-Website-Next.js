export const settingsSchemaQuery = `
	SELECT (
		SELECT COUNT(*)
			FROM information_schema.tables
		WHERE table_schema = DATABASE()
			AND table_name IN ('gacha', 'gacha_stats')
	) AS badge_table_count,
	(
		SELECT COUNT(*)
			FROM information_schema.columns
		WHERE table_schema = DATABASE()
			AND table_name = 'users'
			AND column_name = 'show_pName'
	) AS has_legacy_visibility,
	(
		SELECT COUNT(*)
			FROM information_schema.columns
		WHERE table_schema = DATABASE()
			AND table_name = 'users'
			AND column_name = 'show_past_name'
	) AS has_modern_visibility
`;

export const legacyUserSettingsQuery = `
	SELECT name,
	       past_name,
	       userpage_content,
	       COALESCE(show_pName, 1) AS show_past_names,
	       COALESCE(\`private\`, 0) AS is_private
		FROM users
	WHERE id = ?
	LIMIT 1
`;

export const modernUserSettingsQuery = `
	SELECT name,
	       past_name,
	       userpage_content,
	       COALESCE(show_past_name, 1) AS show_past_names,
	       COALESCE(\`private\`, 0) AS is_private
		FROM users
	WHERE id = ?
	LIMIT 1
`;

export const defaultUserSettingsQuery = `
	SELECT name,
	       past_name,
	       userpage_content,
	       1 AS show_past_names,
	       COALESCE(\`private\`, 0) AS is_private
		FROM users
	WHERE id = ?
	LIMIT 1
`;

export const ownedClanSettingsQuery = `
	SELECT id,
	       tag,
	       past_tag,
	       userpage_content,
	       COALESCE(show_past_tag, 1) AS show_past_tags,
	       COALESCE(\`public\`, 1) AS is_public
		FROM clans
	WHERE owner = ?
	LIMIT 1
`;

export const badgeStateQuery = `
	SELECT COALESCE(set_badge, 0) AS selected_badge, had_badge
		FROM gacha_stats
	WHERE id = ?
	LIMIT 1
`;

export const badgeCatalogQuery = `
	SELECT badge_id, badge_name, prob
		FROM gacha
	ORDER BY badge_id
`;

export const profileSettingsUserForUpdateQuery = `
	SELECT name, past_name
		FROM users
	WHERE id = ?
	LIMIT 1
	FOR UPDATE
`;

export const profileSettingsNameConflictQuery = `
	SELECT id
		FROM users
	WHERE safe_name = ?
		AND id <> ?
	LIMIT 1
`;

export const clanSettingsForUpdateQuery = `
	SELECT id, tag, past_tag
		FROM clans
	WHERE owner = ?
	LIMIT 1
	FOR UPDATE
`;

export const clanSettingsTagConflictQuery = `
	SELECT id
		FROM clans
	WHERE tag = ?
		AND id <> ?
	LIMIT 1
`;

export const updateLegacyProfileSettingsQuery = `
	UPDATE users
		SET name = ?,
		    safe_name = ?,
		    past_name = ?,
		    show_pName = ?,
		    \`private\` = ?
	WHERE id = ?
	LIMIT 1
`;

export const updateModernProfileSettingsQuery = `
	UPDATE users
		SET name = ?,
		    safe_name = ?,
		    past_name = ?,
		    show_past_name = ?,
		    \`private\` = ?
	WHERE id = ?
	LIMIT 1
`;

export const updateDefaultProfileSettingsQuery = `
	UPDATE users
		SET name = ?,
		    safe_name = ?,
		    past_name = ?,
		    \`private\` = ?
	WHERE id = ?
	LIMIT 1
`;

export const updateClanSettingsQuery = `
	UPDATE clans
		SET tag = ?,
		    past_tag = ?,
		    show_past_tag = ?,
		    \`public\` = ?
	WHERE id = ?
		AND owner = ?
	LIMIT 1
`;

export const badgeOwnershipForUpdateQuery = `
	SELECT had_badge
		FROM gacha_stats
	WHERE id = ?
	LIMIT 1
	FOR UPDATE
`;

export const updateSelectedBadgeQuery = `
	UPDATE gacha_stats
		SET set_badge = ?
	WHERE id = ?
	LIMIT 1
`;
