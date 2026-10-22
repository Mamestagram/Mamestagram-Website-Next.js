export const profileUiQuery = `
	SELECT profile_ui
		FROM web_user_settings
	WHERE id = ?
	LIMIT 1
`;

export const profileUiUserForUpdateQuery = `
	SELECT id
		FROM users
	WHERE id = ?
	LIMIT 1
	FOR UPDATE
`;

export const updateProfileUiQuery = `
	INSERT INTO web_user_settings (
		id,
		web_theme,
		web_hue,
		profile_theme,
		profile_hue,
		use_web_appearance,
		profile_ui
	)
	VALUES (?, NULL, NULL, NULL, NULL, NULL, ?)
	ON DUPLICATE KEY UPDATE profile_ui = ?
`;

export const clearProfileUiQuery = `
	UPDATE web_user_settings
	SET profile_ui = NULL
	WHERE id = ?
	LIMIT 1
`;
