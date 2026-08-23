export type SearchCategory = "players" | "clans" | "beatmaps";

export const searchCategoryMeta: Record<SearchCategory, { label: string, icon: string }> = {
	players: {
		label: "Players",
		icon: "users"
	},
	clans: {
		label: "Clans",
		icon: "people-group"
	},
	beatmaps: {
		label: "Beatmaps",
		icon: "compact-disc"
	}
};

export const isSearchCategory = (value: string): value is SearchCategory => value in searchCategoryMeta;

export const getSearchHref = (category: SearchCategory, query: string, page?: number) => {
	const params = new URLSearchParams();
	if (query) params.set("q", query);
	if (page && page > 1) params.set("page", page.toString());
	const queryString = params.toString();
	return `/search/${category}${queryString ? `?${queryString}` : ""}`;
};
