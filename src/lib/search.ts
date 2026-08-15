export type SearchUser = {
	id: number,
	name: string,
	country: string,
	preferredMode: number,
	privileges: number[]
};

export type SearchBeatmapDifficulty = {
	id: number,
	status: number,
	version: string,
	mode: number,
	difficulty: number
};

export type SearchBeatmap = {
	setId: number,
	artist: string,
	title: string,
	creator: string,
	difficulties: SearchBeatmapDifficulty[]
};

export type SearchClan = {
	id: number,
	name: string,
	tag: string,
	preferredMode: number,
	memberCount: number
};

export type SearchPage<T> = {
	items: T[],
	total: number,
	page: number,
	pageSize: number,
	totalPages: number
};

export type SearchResponse = {
	users: SearchUser[],
	clans: SearchClan[],
	beatmaps: SearchBeatmap[],
	totals: {
		users: number,
		clans: number,
		beatmaps: number
	},
	error?: string
};
