import type { SortBy } from "@/database/leaderboard";
import { OsuMode, type VnMode } from "@/lib/mode";

export const LEADERBOARD_DANS_SORT = "dans" as SortBy;
export const LEADERBOARD_PERFORMANCE_SORT = "performance" as SortBy;

export type LeaderboardPlaystyle = "Vanilla" | "Relax" | "Auto Pilot" | "Dans";

export type LeaderboardModeOption = {
	label: LeaderboardPlaystyle;
	mode: OsuMode;
	icon: string;
	dans?: boolean;
};

export type LeaderboardModeGroup = {
	label: string;
	mode: VnMode;
	options: readonly LeaderboardModeOption[];
};

export const leaderboardModeGroups: readonly LeaderboardModeGroup[] = [
	{
		label: "STD",
		mode: OsuMode.std,
		options: [
			{ label: "Vanilla", mode: OsuMode.std, icon: "circle-dot" },
			{ label: "Relax", mode: OsuMode.rxstd, icon: "leaf" },
			{ label: "Auto Pilot", mode: OsuMode.apstd, icon: "location-arrow" },
			{ label: "Dans", mode: OsuMode.std, icon: "medal", dans: true },
		],
	},
	{
		label: "Taiko",
		mode: OsuMode.taiko,
		options: [
			{ label: "Vanilla", mode: OsuMode.taiko, icon: "circle-dot" },
			{ label: "Relax", mode: OsuMode.rxtaiko, icon: "leaf" },
			{ label: "Dans", mode: OsuMode.taiko, icon: "medal", dans: true },
		],
	},
	{
		label: "Catch",
		mode: OsuMode.ctb,
		options: [
			{ label: "Vanilla", mode: OsuMode.ctb, icon: "circle-dot" },
			{ label: "Relax", mode: OsuMode.rxctb, icon: "leaf" },
			{ label: "Dans", mode: OsuMode.ctb, icon: "medal", dans: true },
		],
	},
	{
		label: "Mania",
		mode: OsuMode.mania,
		options: [
			{ label: "Vanilla", mode: OsuMode.mania, icon: "circle-dot" },
			{ label: "Dans", mode: OsuMode.mania, icon: "medal", dans: true },
		],
	},
];

export const getLeaderboardBaseMode = (mode: OsuMode): VnMode => {
	if ([OsuMode.std, OsuMode.rxstd, OsuMode.apstd].includes(mode))
		return OsuMode.std;
	if ([OsuMode.taiko, OsuMode.rxtaiko].includes(mode)) return OsuMode.taiko;
	if ([OsuMode.ctb, OsuMode.rxctb].includes(mode)) return OsuMode.ctb;
	return OsuMode.mania;
};

export const getLeaderboardPlaystyle = (
	mode: OsuMode,
	sortBy: SortBy,
): LeaderboardPlaystyle => {
	if (sortBy === LEADERBOARD_DANS_SORT) return "Dans";
	if ([OsuMode.rxstd, OsuMode.rxtaiko, OsuMode.rxctb].includes(mode))
		return "Relax";
	if (mode === OsuMode.apstd) return "Auto Pilot";
	return "Vanilla";
};

export const getLeaderboardModeGroup = (mode: VnMode) =>
	leaderboardModeGroups.find((group) => group.mode === mode) ??
	leaderboardModeGroups[0];
