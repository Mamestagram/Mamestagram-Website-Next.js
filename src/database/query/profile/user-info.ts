export const userJoinedClanQuery = `
    SELECT CONCAT('[', tag, ']') AS tag
    	FROM clans
    WHERE id = ? -- number
`;

export const setBadgeQuery = `
	SELECT set_badge AS badge_id
	    FROM gacha_stats
	WHERE id = ? -- number
`;

export const clanInfoQuery = `
	SELECT tag, past_tag, show_past_tag, created_at, preferred_mode, userpage_content, public
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
