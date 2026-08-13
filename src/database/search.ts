import { executeQuery } from "@/database/connection";
import {
	beatmapSearchCountQuery,
	beatmapSearchQuery,
	clanSearchCountQuery,
	clanSearchQuery,
	userSearchCountQuery,
	userSearchQuery
} from "@/database/query/search";
import { getPrivs, Priv } from "@/lib/priv";
import type { SearchBeatmap, SearchClan, SearchPage } from "@/lib/search";

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

type BeatmapSearchRow = {
	id: number,
	set_id: number,
	status: number,
	artist: string,
	title: string,
	version: string,
	creator: string,
	mode: number,
	diff: number
};

type ClanSearchRow = {
	id: number,
	name: string,
	tag: string,
	preferred_mode: number,
	member_count: number | string
};

type SearchCountRow = { total: number | string };

const escapeLikePattern = (value: string) => value.replace(/[\\%_]/g, "\\$&");
const getExactId = (query: string) => {
	const parsedId = /^\d+$/.test(query) ? Number(query) : -1;
	return Number.isSafeInteger(parsedId) ? parsedId : -1;
};
const getPagination = (page: number, pageSize: number) => ({
	limit: Math.max(1, Math.trunc(pageSize)),
	offset: Math.max(0, (Math.trunc(page) - 1) * Math.max(1, Math.trunc(pageSize)))
});
const getSearchPage = <T>(items: T[], total: number, page: number, pageSize: number): SearchPage<T> => ({
	items,
	total,
	page,
	pageSize,
	totalPages: Math.max(1, Math.ceil(total / pageSize))
});

export const searchUsers = async (query: string, page = 1, pageSize = 12): Promise<UserSearchResult[]> => {
	const normalized = query.trim().toLocaleLowerCase().replaceAll(" ", "_");
	const escaped = escapeLikePattern(normalized);
	const exactId = getExactId(query.trim());
	const { limit, offset } = getPagination(page, pageSize);
	const rows = await executeQuery<UserSearchRow>(
		userSearchQuery,
		[exactId, `%${escaped}%`, exactId, normalized, `${escaped}%`, limit, offset]
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

export const countSearchUsers = async (query: string): Promise<number> => {
	const normalized = query.trim().toLocaleLowerCase().replaceAll(" ", "_");
	const exactId = getExactId(query.trim());
	const rows = await executeQuery<SearchCountRow>(
		userSearchCountQuery,
		[exactId, `%${escapeLikePattern(normalized)}%`]
	);
	return Number(rows.at(0)?.total ?? 0);
};

export const searchUsersPage = async (query: string, page: number, pageSize: number): Promise<SearchPage<UserSearchResult>> => {
	const [items, total] = await Promise.all([
		searchUsers(query, page, pageSize),
		countSearchUsers(query)
	]);
	return getSearchPage(items, total, page, pageSize);
};

export const searchClans = async (query: string, page = 1, pageSize = 12): Promise<SearchClan[]> => {
	const normalized = query.trim();
	const escaped = escapeLikePattern(normalized);
	const exactId = getExactId(normalized);
	const { limit, offset } = getPagination(page, pageSize);
	const rows = await executeQuery<ClanSearchRow>(
		clanSearchQuery,
		[
			exactId,
			`%${escaped}%`,
			`%${escaped}%`,
			exactId,
			normalized,
			normalized,
			`${escaped}%`,
			`${escaped}%`,
			limit,
			offset
		]
	);

	return rows.map(({ id, name, tag, preferred_mode, member_count }) => ({
		id,
		name,
		tag,
		preferredMode: preferred_mode,
		memberCount: Number(member_count)
	}));
};

export const countSearchClans = async (query: string): Promise<number> => {
	const normalized = query.trim();
	const exactId = getExactId(normalized);
	const contains = `%${escapeLikePattern(normalized)}%`;
	const rows = await executeQuery<SearchCountRow>(clanSearchCountQuery, [exactId, contains, contains]);
	return Number(rows.at(0)?.total ?? 0);
};

export const searchClansPage = async (query: string, page: number, pageSize: number): Promise<SearchPage<SearchClan>> => {
	const [items, total] = await Promise.all([
		searchClans(query, page, pageSize),
		countSearchClans(query)
	]);
	return getSearchPage(items, total, page, pageSize);
};

export const searchBeatmaps = async (query: string, page = 1, pageSize = 12): Promise<SearchBeatmap[]> => {
	const normalized = query.trim();
	const escaped = escapeLikePattern(normalized);
	const exactId = getExactId(normalized);
	const contains = `%${escaped}%`;
	const startsWith = `${escaped}%`;
	const { limit, offset } = getPagination(page, pageSize);
	const rows = await executeQuery<BeatmapSearchRow>(beatmapSearchQuery, [
		exactId,
		exactId,
		contains,
		contains,
		contains,
		contains,
		exactId,
		exactId,
		normalized,
		startsWith,
		startsWith,
		startsWith,
		limit,
		offset
	]);

	return rows.map(({ id, set_id, status, artist, title, version, creator, mode, diff }) => ({
		id,
		setId: set_id,
		status,
		artist,
		title,
		version,
		creator,
		mode,
		difficulty: diff
	}));
};

export const countSearchBeatmaps = async (query: string): Promise<number> => {
	const normalized = query.trim();
	const exactId = getExactId(normalized);
	const contains = `%${escapeLikePattern(normalized)}%`;
	const rows = await executeQuery<SearchCountRow>(beatmapSearchCountQuery, [
		exactId,
		exactId,
		contains,
		contains,
		contains,
		contains
	]);
	return Number(rows.at(0)?.total ?? 0);
};

export const searchBeatmapsPage = async (query: string, page: number, pageSize: number): Promise<SearchPage<SearchBeatmap>> => {
	const [items, total] = await Promise.all([
		searchBeatmaps(query, page, pageSize),
		countSearchBeatmaps(query)
	]);
	return getSearchPage(items, total, page, pageSize);
};
