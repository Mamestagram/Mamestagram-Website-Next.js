// noinspection JSUnusedGlobalSymbols
export enum OsuMode {
	std = "std",
	taiko = "taiko",
	ctb = "ctb",
	mania = "mania",
	rxstd = "rxstd",
	rxtaiko = "rxtaiko",
	rxctb = "rxctb",
	apstd = "apstd"
}

// noinspection JSUnusedGlobalSymbols
export enum ModeNum {
	std,
	taiko,
	ctb,
	mania,
	rxstd,
	rxtaiko,
	rxctb,
	apstd = 8
}

export type VnMode = Extract<OsuMode, OsuMode.std | OsuMode.taiko | OsuMode.ctb | OsuMode.mania>;