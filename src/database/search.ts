import { executeQuery } from "@/database/connection";
import { getPrivs, Priv } from "@/lib/priv";

export type UserSearchResult = {
	id: number,
	name: string,
	country: string,
	preferredMode: number,
	privileges: Priv[]
};

type UserSearchRow = {
	id: number,
	name: string,
	country: string,
	preferred_mode: number,
	priv: number
};

const escapeLikePattern = (value: string) => value.replace(/[\\%_]/g, "\\$&");

export const searchUsers = async (query: string): Promise<UserSearchResult[]> => {
	const normalized = query.trim().toLocaleLowerCase().replaceAll(" ", "_");
	const escaped = escapeLikePattern(normalized);
	const parsedId = /^\d+$/.test(query.trim()) ? Number(query.trim()) : -1;
	const exactId = Number.isSafeInteger(parsedId) ? parsedId : -1;
	const rows = await executeQuery<UserSearchRow>(
		`
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
		`,
		[exactId, `%${escaped}%`, exactId, normalized, `${escaped}%`]
	);

	const uniqueRows = [...new Map(rows.map((row) => [row.id, row])).values()];

	return uniqueRows.map(({ id, name, country, preferred_mode, priv }) => ({
		id,
		name,
		country,
		preferredMode: preferred_mode,
		privileges: getPrivs(priv)
	}));
};
