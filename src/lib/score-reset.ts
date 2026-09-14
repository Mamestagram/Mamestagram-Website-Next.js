export const scoreResetModes = [
	"std",
	"taiko",
	"ctb",
	"mania",
	"rxstd",
	"rxtaiko",
	"rxctb",
	"apstd",
] as const;

export type ScoreResetMode = (typeof scoreResetModes)[number];

export const scoreResetModeLabels = {
	std: "Standard",
	taiko: "Taiko",
	ctb: "Catch",
	mania: "Mania",
	rxstd: "Relax Standard",
	rxtaiko: "Relax Taiko",
	rxctb: "Relax Catch",
	apstd: "Auto Pilot Standard",
} satisfies Record<ScoreResetMode, string>;

export const isScoreResetMode = (value: unknown): value is ScoreResetMode =>
	typeof value === "string" &&
	scoreResetModes.some((mode) => mode === value);
