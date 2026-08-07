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
`;
