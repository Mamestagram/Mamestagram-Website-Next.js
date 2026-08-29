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
	) AS has_modern_visibility,
	(
		SELECT COUNT(*)
			FROM information_schema.columns
		WHERE table_schema = DATABASE()
			AND table_name = 'users'
			AND column_name = 'web_theme'
	) AS has_web_theme,
	(
		SELECT COUNT(*)
			FROM information_schema.columns
		WHERE table_schema = DATABASE()
			AND table_name = 'users'
			AND column_name = 'web_hue'
	) AS has_web_hue,
	(
		SELECT COUNT(*)
			FROM information_schema.columns
		WHERE table_schema = DATABASE()
			AND table_name = 'users'
			AND column_name = 'profile_theme'
	) AS has_profile_theme,
	(
		SELECT COUNT(*)
			FROM information_schema.columns
		WHERE table_schema = DATABASE()
			AND table_name = 'users'
			AND column_name = 'profile_hue'
	) AS has_profile_hue,
	(
		SELECT COUNT(*)
			FROM information_schema.columns
		WHERE table_schema = DATABASE()
			AND table_name = 'users'
			AND column_name = 'use_web_appearance'
	) AS has_use_web_appearance,
	(
		SELECT COUNT(*)
			FROM information_schema.columns
		WHERE table_schema = DATABASE()
			AND table_name = 'clans'
			AND column_name = 'profile_theme'
	) AS has_clan_profile_theme,
	(
		SELECT COUNT(*)
			FROM information_schema.columns
		WHERE table_schema = DATABASE()
			AND table_name = 'clans'
			AND column_name = 'profile_hue'
	) AS has_clan_profile_hue
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
	       COALESCE(\`public\`, 1) AS is_public,
	       COALESCE(profile_theme, 1) AS profile_theme,
	       profile_hue
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
    SET name           = ?,
        safe_name      = ?,
        past_name      = ?,
        show_past_name = ?
    WHERE id = ?
    LIMIT 1
`;

export const updateModernProfileSettingsQuery = `
    UPDATE users
    SET name           = ?,
        safe_name      = ?,
        past_name      = ?,
        show_past_name = ?
    WHERE id = ?
    LIMIT 1
`;

export const updateDefaultProfileSettingsQuery = `
    UPDATE users
    SET name      = ?,
        safe_name = ?,
        past_name = ?
    WHERE id = ?
    LIMIT 1
`;

export const updateClanSettingsQuery = `
    UPDATE clans
    SET tag           = ?,
        past_tag      = ?,
        show_past_tag = ?
    WHERE id = ?
      AND owner = ?
    LIMIT 1
`;

export const updateProfilePrivacyQuery = `
    UPDATE users
    SET \`private\` = ?
    WHERE id = ?
    LIMIT 1
`;

export const updateWebAppearanceQuery = `
    UPDATE users
    SET web_theme     = ?,
        web_hue       = ?,
        profile_theme = CASE
                            WHEN COALESCE(use_web_appearance, 0) = 1 THEN ?
                            ELSE profile_theme
            END,
        profile_hue   = CASE
                            WHEN COALESCE(use_web_appearance, 0) = 1 THEN ?
                            ELSE profile_hue
            END
    WHERE id = ?
    LIMIT 1
`;

export const userWebThemeQuery = `
	SELECT COALESCE(web_theme, 1) AS web_theme
		FROM users
	WHERE id = ?
	LIMIT 1
`;

export const userWebHueQuery = `
	SELECT web_hue
		FROM users
	WHERE id = ?
	LIMIT 1
`;

export const userUseWebAppearanceQuery = `
	SELECT COALESCE(use_web_appearance, 0) AS use_web_appearance
		FROM users
	WHERE id = ?
	LIMIT 1
`;

export const updateProfileConfigurationQuery = `
    UPDATE users
    SET \`private\`        = ?,
        use_web_appearance = ?,
        profile_theme      = CASE WHEN ? = 1 THEN web_theme ELSE ? END,
        profile_hue        = CASE WHEN ? = 1 THEN web_hue ELSE ? END
    WHERE id = ?
    LIMIT 1
`;

export const userProfileThemeQuery = `
	SELECT COALESCE(profile_theme, 1) AS profile_theme
		FROM users
	WHERE id = ?
	LIMIT 1
`;

export const userProfileHueQuery = `
	SELECT profile_hue
		FROM users
	WHERE id = ?
	LIMIT 1
`;

export const updateClanPrivacyQuery = `
    UPDATE clans
    SET \`public\` = ?
    WHERE id = ?
      AND owner = ?
    LIMIT 1
`;

export const updateClanProfileConfigurationQuery = `
    UPDATE clans
    SET \`public\`    = ?,
        profile_theme = ?,
        profile_hue   = ?
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
