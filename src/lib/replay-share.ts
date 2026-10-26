export const parseReplayId = (value: string | string[] | undefined | null): number | null => {
	if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
	const id = Number(value);
	return Number.isSafeInteger(id) ? id : null;
};

export const getReplayShareHref = (beatmapHref: string, scoreId: number): string =>
	`${beatmapHref}${beatmapHref.includes("?") ? "&" : "?"}replay=${scoreId}`;
