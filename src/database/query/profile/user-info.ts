export const otherUserInfoQuery = `
	SELECT tag, past_name, show_past_name
	    FROM users u
	LEFT JOIN clans c
		ON clan_id = c.id
	WHERE u.id = ?
`;

export const clanInfoQuery = `
	SELECT tag,
       past_tag,
       show_past_tag,
       created_at,
       preferred_mode,
       public
	    FROM clans
	WHERE id = ?
`;

export const mutualQuery = `
	SELECT following.user2 AS user
	    FROM relationships following
	JOIN relationships followers
		ON followers.type = 'friend'
		AND following.user2 = followers.user1
		AND following.user1 = followers.user2
	WHERE following.type = 'friend'
		AND following.user1 = ?
	ORDER BY following.user2
`;

export const followingQuery = `
	SELECT user2 AS user
	    FROM relationships following
	WHERE type = 'friend'
	    AND EXISTS(
	        SELECT *
	            FROM relationships followers
	        WHERE followers.type = 'friend'
	            AND followers.user1 = following.user2
	            AND followers.user2 = following.user1
	    ) = 0
	    AND user1 = ?
	ORDER BY user2
`;

export const followersQuery = `
	SELECT user1 AS user
	    FROM relationships followers
	WHERE type = 'friend'
	    AND EXISTS(
	        SELECT *
	            FROM relationships following
	        WHERE following.type = 'friend'
	            AND following.user1 = followers.user2
	            AND following.user2 = followers.user1
	    ) = 0
	    AND user2 = ?
	ORDER BY user1
`;
