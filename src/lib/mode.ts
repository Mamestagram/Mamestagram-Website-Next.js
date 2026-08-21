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

export const getVanillaMode = (mode: ModeNum): VnMode => {
	switch (mode) {
		case ModeNum.taiko:
		case ModeNum.rxtaiko:
			return OsuMode.taiko;
		case ModeNum.ctb:
		case ModeNum.rxctb:
			return OsuMode.ctb;
		case ModeNum.mania:
			return OsuMode.mania;
		default:
			return OsuMode.std;
	}
};

export const modeAbbreviation = (mode: ModeNum) => {
	switch (mode) {
		case ModeNum.std: return "vn!osu";
		case ModeNum.taiko: return "vn!taiko";
		case ModeNum.ctb: return "vn!ctb";
		case ModeNum.mania: return "vn!mania";
		case ModeNum.rxstd: return "rx!osu";
		case ModeNum.rxtaiko: return "rx!taiko";
		case ModeNum.rxctb: return "rx!ctb";
		case ModeNum.apstd: return "ap!osu";
	}
}
