import { executeQuery } from "@/database/connection";
import { userSearchQuery } from "@/database/query/search";
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
		userSearchQuery,
		[exactId, `%${escaped}%`, exactId, normalized, `${escaped}%`]
	);

	const rowsById = new Map<number, UserSearchRow>();
	rows.forEach((row) => {
		const existing = rowsById.get(row.id);
		if (existing) existing.priv |= row.priv;
		else rowsById.set(row.id, { ...row });
	});
	const uniqueRows = [...rowsById.values()];

	return uniqueRows.map(({ id, name, country, preferred_mode, priv }) => ({
		id,
		name,
		country,
		preferredMode: preferred_mode,
		privileges: getPrivs(priv)
	}));
};
