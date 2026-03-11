// noinspection JSUnusedGlobalSymbols
export enum Mode {
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

export type VnMode = Extract<Mode, Mode.std | Mode.taiko | Mode.ctb | Mode.mania>;