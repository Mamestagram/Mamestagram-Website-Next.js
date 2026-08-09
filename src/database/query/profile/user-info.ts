export const userExistsQuery = `
	SELECT EXISTS(
		SELECT *
			FROM users
		WHERE id = ?
	) AS user_exists
`;

export const clanExistsQuery = `
	SELECT EXISTS(
		SELECT *
			FROM clans
		WHERE id = ?
	) AS clan_exists
`;

export const userNameQuery = `
	SELECT name
		FROM users
	WHERE id = ?
`;

export const clanTagQuery = `
	SELECT tag
		FROM clans
	WHERE id = ?
`;

export const userPreferredModeQuery = `
	SELECT preferred_mode
		FROM users
	WHERE id = ?
`;

export const clanPreferredModeQuery = `
	SELECT preferred_mode
		FROM clans
	WHERE id = ?
`;

export const updateUserpageContentQuery = `
	UPDATE users
		SET userpage_content = ?
	WHERE id = ?
	LIMIT 1
`;

export const updateClanUserpageContentQuery = `
	UPDATE clans
		SET userpage_content = ?
	WHERE id = ?
		AND owner = ?
	LIMIT 1
`;

export const clanOwnerQuery = `
	SELECT id
		FROM clans
	WHERE id = ?
		AND owner = ?
	LIMIT 1
`;

export const updateClanPreferredModeQuery = `
	UPDATE clans
		SET preferred_mode = ?
	WHERE id = ?
		AND owner = ?
	LIMIT 1
`;

export const updateUserPreferredModeQuery = `
	UPDATE users
		SET preferred_mode = ?
	WHERE id = ?
	LIMIT 1
`;

export const removableClanMemberQuery = `
	SELECT u.id
		FROM users u
	JOIN clans c
		ON c.id = u.clan_id
	WHERE c.id = ?
		AND c.owner = ?
		AND u.id = ?
		AND u.id <> c.owner
	LIMIT 1
`;

export const removeClanMemberQuery = `
	UPDATE users
		SET clan_id = 0,
		    clan_priv = 0
	WHERE id = ?
		AND clan_id = ?
		AND id <> ?
		AND EXISTS(
			SELECT 1
				FROM clans
			WHERE id = ?
				AND owner = ?
		)
	LIMIT 1
`;

export const userJoinedClanQuery = `
    SELECT CONCAT('[', tag, ']') AS tag
    	FROM clans
    WHERE id = ? -- number
`;

export const setBadgeQuery = `
	SELECT badge_id
	    FROM market_badge_equipment
	WHERE owner_id = ? -- number
`;

export const clanInfoQuery = `
	SELECT tag, past_tag, show_past_tag, created_at, preferred_mode, userpage_content, public, owner
	    FROM clans
	WHERE id = ? -- number
`;

export const mutualQuery = `
	SELECT following.user2 AS user, users.name, users.country
	    FROM relationships following
	JOIN relationships followers
		ON followers.type = 'friend'
		AND following.user2 = followers.user1
		AND following.user1 = followers.user2
	JOIN users
		ON users.id = following.user2
	WHERE following.type = 'friend'
		AND following.user1 = ? -- number
		AND following.user2 >= 3
	ORDER BY following.user2
`;

export const followingQuery = `
	SELECT following.user2 AS user, users.name, users.country
	    FROM relationships following
	JOIN users
		ON users.id = following.user2
	WHERE type = 'friend'
	    AND EXISTS(
	        SELECT *
	            FROM relationships followers
	        WHERE followers.type = 'friend'
	            AND followers.user1 = following.user2
	            AND followers.user2 = following.user1
	    ) = 0
	    AND following.user1 = ? -- number
	    AND following.user2 >= 3
	ORDER BY following.user2
`;

export const followersQuery = `
	SELECT followers.user1 AS user, users.name, users.country
	    FROM relationships followers
	JOIN users
		ON users.id = followers.user1
	WHERE type = 'friend'
	    AND EXISTS(
	        SELECT *
	            FROM relationships following
	        WHERE following.type = 'friend'
	            AND following.user1 = followers.user2
	            AND following.user2 = followers.user1
	    ) = 0
	    AND followers.user2 = ? -- number
	    AND followers.user1 >= 3
	ORDER BY followers.user1
`;
