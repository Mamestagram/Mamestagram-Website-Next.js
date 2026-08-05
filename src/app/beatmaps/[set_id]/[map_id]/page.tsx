import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AudioPreview from "@/components/beatmap/audio-preview";
import CountryFlag from "@/components/country-flag";
import FontAwesome from "@/components/font-awesome";
import ModeIcon from "@/components/mode-icon";
import {
	getBeatmap,
	getBeatmapDifficulties,
	getBeatmapScores,
	getBeatmapUserScore,
	type BeatmapScore
} from "@/database/beatmap";
import { BeatmapStatus } from "@/lib/beatmap-status";
import { ModeNum, OsuMode, type VnMode } from "@/lib/mode";
import { Mods, ModNum } from "@/lib/mods";
import { getCurrentUser } from "@/lib/session";
import styles from "@s/beatmap.module.css";

type PageParams = { set_id: string, map_id: string };
type PageSearchParams = {
	mode?: string | string[],
	mods?: string | string[]
};

type ScoreModeOption = {
	route: OsuMode,
	mode: ModeNum,
	label: string
};

type HitColumn = {
	label: string,
	getValue: (score: BeatmapScore) => string
};

type ModTone = "easy" | "hard" | "other";

type ModFilterOption = {
	mod: Mods,
	label?: string,
	tone: ModTone
};

const statusMeta: Record<number, { label: string, tone: string }> = {
	[BeatmapStatus.notSubmitted]: { label: "Not submitted", tone: "unsubmitted" },
	[BeatmapStatus.graveyard]: { label: "Graveyard", tone: "graveyard" },
	[BeatmapStatus.updateAvailable]: { label: "Pending", tone: "pending" },
	[BeatmapStatus.ranked]: { label: "Ranked", tone: "ranked" },
	[BeatmapStatus.approved]: { label: "Approved", tone: "approved" },
	[BeatmapStatus.qualified]: { label: "Qualified", tone: "qualified" },
	[BeatmapStatus.loved]: { label: "Loved", tone: "loved" }
};

const modEntries: ReadonlyArray<{ mod: Mods, value: ModNum }> = [
	{ mod: Mods.nm, value: ModNum.nm },
	{ mod: Mods.nf, value: ModNum.nf },
	{ mod: Mods.ez, value: ModNum.ez },
	{ mod: Mods.ts, value: ModNum.ts },
	{ mod: Mods.hd, value: ModNum.hd },
	{ mod: Mods.hr, value: ModNum.hr },
	{ mod: Mods.sd, value: ModNum.sd },
	{ mod: Mods.dt, value: ModNum.dt },
	{ mod: Mods.rx, value: ModNum.rx },
	{ mod: Mods.ht, value: ModNum.ht },
	{ mod: Mods.nc, value: ModNum.nc },
	{ mod: Mods.fl, value: ModNum.fl },
	{ mod: Mods.at, value: ModNum.at },
	{ mod: Mods.so, value: ModNum.so },
	{ mod: Mods.ap, value: ModNum.ap },
	{ mod: Mods.pf, value: ModNum.pf },
	{ mod: Mods.k4, value: ModNum.k4 },
	{ mod: Mods.k5, value: ModNum.k5 },
	{ mod: Mods.k6, value: ModNum.k6 },
	{ mod: Mods.k7, value: ModNum.k7 },
	{ mod: Mods.k8, value: ModNum.k8 },
	{ mod: Mods.fi, value: ModNum.fi },
	{ mod: Mods.rd, value: ModNum.rd },
	{ mod: Mods.cm, value: ModNum.cm },
	{ mod: Mods.tr, value: ModNum.tr },
	{ mod: Mods.k9, value: ModNum.k9 },
	{ mod: Mods.kc, value: ModNum.kc },
	{ mod: Mods.k1, value: ModNum.k1 },
	{ mod: Mods.k3, value: ModNum.k3 },
	{ mod: Mods.k2, value: ModNum.k2 },
	{ mod: Mods.v2, value: ModNum.v2 },
	{ mod: Mods.mr, value: ModNum.mr }
];

const parseId = (value: string) => {
	if (!/^-?\d+$/.test(value)) return null;
	const id = Number(value);
	return Number.isSafeInteger(id) ? id : null;
};

const getVanillaMode = (mode: ModeNum): VnMode => {
	switch (mode) {
		case ModeNum.taiko: return OsuMode.taiko;
		case ModeNum.ctb: return OsuMode.ctb;
		case ModeNum.mania: return OsuMode.mania;
		default: return OsuMode.std;
	}
};

const getScoreModeOptions = (mode: ModeNum): ScoreModeOption[] => {
	switch (mode) {
		case ModeNum.std:
			return [
				{ route: OsuMode.std, mode: ModeNum.std, label: "Vanilla" },
				{ route: OsuMode.rxstd, mode: ModeNum.rxstd, label: "Relax" },
				{ route: OsuMode.apstd, mode: ModeNum.apstd, label: "Autopilot" },
				{ route: OsuMode.taiko, mode: ModeNum.taiko, label: "Taiko" },
				{ route: OsuMode.ctb, mode: ModeNum.ctb, label: "Catch" },
				{ route: OsuMode.mania, mode: ModeNum.mania, label: "Mania" }
			];
		case ModeNum.taiko:
			return [
				{ route: OsuMode.taiko, mode: ModeNum.taiko, label: "Vanilla" },
				{ route: OsuMode.rxtaiko, mode: ModeNum.rxtaiko, label: "Relax" }
			];
		case ModeNum.ctb:
			return [
				{ route: OsuMode.ctb, mode: ModeNum.ctb, label: "Vanilla" },
				{ route: OsuMode.rxctb, mode: ModeNum.rxctb, label: "Relax" }
			];
		default:
			return [{ route: OsuMode.mania, mode: ModeNum.mania, label: "Vanilla" }];
	}
};

const getBaseScoreMode = (mode: ModeNum): ModeNum => {
	switch (mode) {
		case ModeNum.taiko:
		case ModeNum.rxtaiko:
			return ModeNum.taiko;
		case ModeNum.ctb:
		case ModeNum.rxctb:
			return ModeNum.ctb;
		case ModeNum.mania:
			return ModeNum.mania;
		default:
			return ModeNum.std;
	}
};

const getModFilterOptions = (mode: ModeNum): ModFilterOption[] => {
	const common: ModFilterOption[] = [
		{ mod: Mods.nm, tone: "other" },
		{ mod: Mods.ez, tone: "easy" },
		{ mod: Mods.nf, tone: "easy" },
		{ mod: Mods.ht, tone: "easy" },
		{ mod: Mods.hr, tone: "hard" },
		{ mod: Mods.sd, tone: "hard" },
		{ mod: Mods.pf, tone: "hard" },
		{ mod: Mods.dt, tone: "hard" },
		{ mod: Mods.nc, tone: "hard" }
	];
	const standard: ModFilterOption[] = [
		...common,
		{ mod: Mods.hd, tone: "hard" },
		{ mod: Mods.fl, tone: "hard" }
	];

	switch (mode) {
		case ModeNum.std:
			return [
				...standard,
				{ mod: Mods.so, tone: "other" },
				{ mod: Mods.v2, tone: "other" }
			];
		case ModeNum.taiko:
		case ModeNum.ctb:
			return [...standard, { mod: Mods.v2, tone: "other" }];
		case ModeNum.mania:
			return [
				...common,
				{ mod: Mods.fi, label: "FI", tone: "hard" },
				{ mod: Mods.hd, tone: "hard" },
				{ mod: Mods.fl, tone: "hard" },
				{ mod: Mods.k4, label: "4K", tone: "other" },
				{ mod: Mods.k5, label: "5K", tone: "other" },
				{ mod: Mods.k6, label: "6K", tone: "other" },
				{ mod: Mods.k7, label: "7K", tone: "other" },
				{ mod: Mods.k8, label: "8K", tone: "other" },
				{ mod: Mods.k9, label: "9K", tone: "other" },
				{ mod: Mods.rd, tone: "other" },
				{ mod: Mods.mr, tone: "other" },
				{ mod: Mods.v2, tone: "other" }
			];
		default:
			return [];
	}
};

const getHitColumns = (mode: ModeNum): HitColumn[] => {
	switch (mode) {
		case ModeNum.taiko:
			return [
				{ label: "Great", getValue: (score) => (score.n300 + score.nGeki).toLocaleString() },
				{ label: "Good", getValue: (score) => (score.n100 + score.nKatu).toLocaleString() },
				{ label: "Miss", getValue: (score) => score.nMiss.toLocaleString() }
			];
		case ModeNum.ctb:
			return [
				{ label: "Fruits", getValue: (score) => score.n300.toLocaleString() },
				{ label: "Ticks", getValue: (score) => score.n100.toLocaleString() },
				{
					label: "Drops",
					getValue: (score) => `${score.n50.toLocaleString()}/${(score.n50 + score.nKatu).toLocaleString()}`
				},
				{ label: "Miss", getValue: (score) => score.nMiss.toLocaleString() }
			];
		case ModeNum.mania:
			return [
				{ label: "Marv", getValue: (score) => score.nGeki.toLocaleString() },
				{ label: "Perfect", getValue: (score) => score.n300.toLocaleString() },
				{ label: "Great", getValue: (score) => score.nKatu.toLocaleString() },
				{ label: "Good", getValue: (score) => score.n100.toLocaleString() },
				{ label: "Bad", getValue: (score) => score.n50.toLocaleString() },
				{ label: "Miss", getValue: (score) => score.nMiss.toLocaleString() }
			];
		default:
			return [
				{ label: "300+Geki", getValue: (score) => (score.n300 + score.nGeki).toLocaleString() },
				{ label: "100+Katu", getValue: (score) => (score.n100 + score.nKatu).toLocaleString() },
				{ label: "50", getValue: (score) => score.n50.toLocaleString() },
				{ label: "Miss", getValue: (score) => score.nMiss.toLocaleString() }
			];
	}
};

const getMods = (mods: number) => modEntries.filter(({ value }) => {
	if ((mods & value) === 0) return false;
	if (value === ModNum.dt && (mods & ModNum.nc) > 0) return false;
	return !(value === ModNum.sd && (mods & ModNum.pf) > 0);
});

const isKnownMod = (mod: string): mod is Mods => modEntries.some((entry) => entry.mod === mod);

const getModTone = (mod: Mods): ModTone => {
	if ([Mods.ez, Mods.nf, Mods.ht].includes(mod)) return "easy";
	if ([Mods.hr, Mods.sd, Mods.pf, Mods.dt, Mods.nc, Mods.fi, Mods.hd, Mods.fl].includes(mod))
		return "hard";
	return "other";
};

const formatDuration = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	return `${minutes}:${Math.max(0, seconds % 60).toString().padStart(2, "0")}`;
};

const formatRelativeTime = (date: Date) => {
	const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
	if (seconds < 60) return "now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d`;
	const months = Math.floor(days / 30);
	if (months < 12) return `${months}mo`;
	return `${Math.floor(days / 365)}y`;
};

const difficultyColorStops = [
	{ rating: 0, hue: 213, saturation: 95, lightness: 62 },
	{ rating: 1, hue: 193, saturation: 100, lightness: 64 },
	{ rating: 2, hue: 132, saturation: 100, lightness: 65 },
	{ rating: 3, hue: 56, saturation: 91, lightness: 66 },
	{ rating: 4, hue: 8, saturation: 100, lightness: 70 },
	{ rating: 5, hue: 342, saturation: 100, lightness: 65 },
	{ rating: 6, hue: 299, saturation: 53, lightness: 52 },
	{ rating: 7, hue: 241, saturation: 65, lightness: 63 },
	{ rating: 8, hue: 242, saturation: 74, lightness: 32 },
	{ rating: 9, hue: 242, saturation: 75, lightness: 5 }
] as const;

const difficultyColor = (difficulty: number) => {
	const rating = Math.max(0, Math.min(9, difficulty));
	const upperIndex = difficultyColorStops.findIndex((stop) => stop.rating >= rating);
	if (upperIndex <= 0) {
		const color = difficultyColorStops[0];
		return `hsl(${color.hue}, ${color.saturation}%, ${color.lightness}%)`;
	}

	const lower = difficultyColorStops[upperIndex - 1];
	const upper = difficultyColorStops[upperIndex];
	const progress = (rating - lower.rating) / (upper.rating - lower.rating);
	const hueDistance = ((upper.hue - lower.hue + 540) % 360) - 180;
	const hue = (lower.hue + hueDistance * progress + 360) % 360;
	const saturation = lower.saturation + (upper.saturation - lower.saturation) * progress;
	const lightness = lower.lightness + (upper.lightness - lower.lightness) * progress;

	return `hsl(${hue.toFixed(1)}, ${saturation.toFixed(1)}%, ${lightness.toFixed(1)}%)`;
};

const getStatWidth = (value: number) => `${Math.min(100, Math.max(0, value * 10))}%`;

function ModsList({ mods }: Readonly<{ mods: number }>) {
	const scoreMods = getMods(mods);
	if (scoreMods.length === 0) return <span className={styles.no_mod} data-tone="other">NM</span>;
	return (
		<span className={styles.mod_list}>
			{scoreMods.map(({ mod }) =>
				<span key={mod} className={styles.mod_badge} data-tone={getModTone(mod)}>
					{mod.toUpperCase()}
				</span>) }
		</span>
	);
}

function FeaturedScoreCard({ score, rank, mode, mapMaxCombo, personal = false }: Readonly<{
	score: BeatmapScore,
	rank: number,
	mode: OsuMode,
	mapMaxCombo: number,
	personal?: boolean
}>) {
	return (
		<div className={classNames(styles.top_score, { [styles.personal_score]: personal })}>
			<span className={classNames(styles.top_rank, { [styles.personal_rank]: personal })}>#{rank}</span>
			<span className={styles.top_grade} data-grade={score.grade.toLowerCase()}>
				{score.grade.replace(/H$/, "")}
			</span>
			<Link className={styles.top_avatar} href={`/profile/${score.userId}/${mode}`}>
				<Image src={`https://a.${process.env.BASE_DOMAIN}/${score.userId}`}
				       alt=""
				       fill
				       sizes="64px"/>
			</Link>
			<span className={styles.top_player}>
				<small>{personal ? "Your score" : "Top score"}</small>
				<Link href={`/profile/${score.userId}/${mode}`}>{score.name}</Link>
				<span><CountryFlag code={score.country} escapeOverflow/> achieved {formatRelativeTime(score.playTime)} ago</span>
			</span>
			<span className={styles.top_metric}><small>Total score</small><strong>{score.score.toLocaleString()}</strong></span>
			<span className={styles.top_metric}>
				<small>Accuracy</small>
				<strong className={classNames({ [styles.perfect_value]: score.accuracy === 100 })}>
					{score.accuracy.toFixed(2)}%
				</strong>
			</span>
			<span className={styles.top_metric}>
				<small>Max combo</small>
				<strong className={classNames({ [styles.perfect_value]: score.maxCombo === mapMaxCombo })}>
					{score.maxCombo.toLocaleString()}x
				</strong>
			</span>
			<span className={classNames(styles.top_metric, styles.top_pp)}><small>Performance</small><strong>{Math.round(score.pp).toLocaleString()}<small>pp</small></strong></span>
			<ModsList mods={score.mods}/>
		</div>
	);
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
	const { set_id, map_id } = await params;
	const setId = parseId(set_id), mapId = parseId(map_id);
	if (setId === null || mapId === null) return { title: "Beatmap not found" };
	const map = await getBeatmap(setId, mapId);
	return map
		? { title: `${map.artist} - ${map.title}` }
		: { title: "Beatmap not found" };
}

export default async function BeatmapPage({ params, searchParams }: {
	params: Promise<PageParams>,
	searchParams: Promise<PageSearchParams>
}) {
	const [{ set_id, map_id }, query] = await Promise.all([params, searchParams]);
	const setId = parseId(set_id), mapId = parseId(map_id);
	if (setId === null || mapId === null) notFound();

	const map = await getBeatmap(setId, mapId);
	if (!map) notFound();

	const scoreModeOptions = getScoreModeOptions(map.mode);
	const convertScoreModeOptions = map.mode === ModeNum.std
		? scoreModeOptions.filter(({ mode }) => [ModeNum.std, ModeNum.taiko, ModeNum.ctb, ModeNum.mania].includes(mode))
		: [];
	const playstyleScoreModeOptions = map.mode === ModeNum.std
		? scoreModeOptions.filter(({ mode }) => [ModeNum.std, ModeNum.rxstd, ModeNum.apstd].includes(mode))
		: scoreModeOptions;
	const requestedMode = Array.isArray(query.mode) ? query.mode[0] : query.mode;
	const selectedScoreMode = scoreModeOptions.find(({ route }) => route === requestedMode) ?? scoreModeOptions[0];
	const selectedBaseScoreMode = getBaseScoreMode(selectedScoreMode.mode);
	const modFilterOptions = getModFilterOptions(selectedBaseScoreMode);
	const allowedFilterMods = new Set(modFilterOptions.map(({ mod }) => mod));
	const requestedMods = Array.isArray(query.mods) ? query.mods[0] : query.mods;
	const parsedSelectedMods = [...new Set((requestedMods ?? "")
		.split(",")
		.map((mod) => mod.trim().toLowerCase())
		.filter(isKnownMod)
		.filter((mod) => allowedFilterMods.has(mod)))];
	const mutuallyExclusiveModGroups: Mods[][] = [
		[Mods.sd, Mods.pf],
		[Mods.ez, Mods.hr],
		[Mods.ht, Mods.dt, Mods.nc]
	];
	if (selectedBaseScoreMode === ModeNum.mania) {
		mutuallyExclusiveModGroups.push(
			[Mods.fi, Mods.hd],
			[Mods.k4, Mods.k5, Mods.k6, Mods.k7, Mods.k8, Mods.k9]
		);
	}
	const getMutuallyExclusiveModGroup = (mod: Mods) =>
		mutuallyExclusiveModGroups.find((group) => group.includes(mod));
	const selectMod = (mods: Mods[], mod: Mods) => {
		if (mod === Mods.nm) return [Mods.nm];
		const exclusiveGroup = getMutuallyExclusiveModGroup(mod);
		return [...mods.filter((selectedMod) => selectedMod !== Mods.nm && !exclusiveGroup?.includes(selectedMod)), mod];
	};
	const selectedMods = parsedSelectedMods.reduce<Mods[]>((mods, mod) => selectMod(mods, mod), []);
	const [difficulties, allScores, currentUser] = await Promise.all([
		getBeatmapDifficulties(map.setId, map.server),
		getBeatmapScores(map.id, selectedScoreMode.mode),
		getCurrentUser()
	]);
	const displayedDifficulties = difficulties.some((difficulty) => difficulty.id === map.id)
		? difficulties
		: [...difficulties, {
			id: map.id,
			setId: map.setId,
			version: map.version,
			mode: map.mode,
			difficulty: map.difficulty,
			cs: map.cs
		}].sort((a, b) => a.mode - b.mode || a.difficulty - b.difficulty || a.id - b.id);
	const scoreModeMod = [ModeNum.rxstd, ModeNum.rxtaiko, ModeNum.rxctb].includes(selectedScoreMode.mode)
		? ModNum.rx
		: selectedScoreMode.mode === ModeNum.apstd ? ModNum.ap : ModNum.nm;
	const matchesSelectedMods = (score: BeatmapScore) => {
		if (selectedMods.length === 0) return true;
		if (selectedMods.includes(Mods.nm)) return (score.mods & ~scoreModeMod) === ModNum.nm;
		const mods = getMods(score.mods).map(({ mod }) => mod);
		return selectedMods.every((selectedMod) => mods.includes(selectedMod));
	};
	const scores = allScores.filter(matchesSelectedMods);
	const getScoreHref = (mode: ScoreModeOption, mods: Mods[] = selectedMods) => {
		const hrefQuery = new URLSearchParams();
		if (mode !== scoreModeOptions[0]) hrefQuery.set("mode", mode.route);
		if (mods.length > 0) hrefQuery.set("mods", mods.join(","));
		const search = hrefQuery.toString();
		return `/beatmaps/${map.setId}/${map.id}${search ? `?${search}` : ""}`;
	};
	const toggleMod = (mod: Mods) => {
		if (selectedMods.includes(mod)) return selectedMods.filter((selectedMod) => selectedMod !== mod);
		return selectMod(selectedMods, mod);
	};
	const cyclicModPairs = new Map<Mods, Mods>([
		[Mods.sd, Mods.pf],
		[Mods.dt, Mods.nc]
	]);
	if (selectedBaseScoreMode === ModeNum.mania) cyclicModPairs.set(Mods.fi, Mods.hd);
	const cyclicSecondMods = new Set(cyclicModPairs.values());
	const getActiveCyclicMod = (firstMod: Mods, secondMod: Mods) => {
		if (selectedMods.includes(secondMod)) return secondMod;
		if (selectedMods.includes(firstMod)) return firstMod;
		return null;
	};
	const cycleModFilter = (firstMod: Mods, secondMod: Mods) => {
		const activeMod = getActiveCyclicMod(firstMod, secondMod);
		const otherMods = selectedMods.filter((mod) => mod !== firstMod && mod !== secondMod);
		if (activeMod === firstMod) return selectMod(otherMods, secondMod);
		if (activeMod === secondMod) return otherMods;
		return selectMod(otherMods, firstMod);
	};
	const getModFilterLabel = (mod: Mods) => {
		const option = modFilterOptions.find(({ mod: optionMod }) => optionMod === mod);
		return option?.label ?? mod.toUpperCase();
	};
	const hitColumns = getHitColumns(selectedBaseScoreMode);
	const status = statusMeta[map.status] ?? { label: "Unknown", tone: "unknown" };
	const successRate = map.plays > 0 ? map.passes / map.plays * 100 : 0;
	const vanillaMode = getVanillaMode(map.mode);
	const cover = map.server === "osu!" && map.setId > 0
		? `https://assets.ppy.sh/beatmaps/${map.setId}/covers/cover.jpg`
		: "/images/banner/maplist.jpg";
	const topScore = scores[0];
	let personalScore: { score: BeatmapScore, rank: number } | null = null;
	if (currentUser.isLoggedIn && currentUser.id) {
		const apiScoreIndex = allScores.findIndex((score) => score.userId === currentUser.id);
		if (apiScoreIndex >= 0) {
			personalScore = { score: allScores[apiScoreIndex], rank: apiScoreIndex + 1 };
		}
		else {
			const databaseScore = await getBeatmapUserScore(map.md5, selectedScoreMode.mode, currentUser.id);
			if (databaseScore) personalScore = { score: databaseScore, rank: databaseScore.rank };
		}
		if (personalScore && (!matchesSelectedMods(personalScore.score) || topScore?.userId === currentUser.id))
			personalScore = null;
	}

	return (
		<div className={styles.page}>
			<section className={styles.hero}>
				<Image className={styles.hero_image}
				       src={cover}
				       alt=""
				       fill
				       priority
				       unoptimized
				       sizes="100vw"/>
				<div className={styles.hero_shade}/>
				<div className={styles.hero_content}>
					<div className={styles.hero_primary}>
						<div className={styles.hero_topline}>
							<span className={styles.eyebrow}>
								<FontAwesome prefix="fad" name="music-note"/>
								Beatmap info
							</span>
							<span className={styles.status} data-tone={status.tone}>{status.label}</span>
						</div>
						<div className={styles.hero_identity}>
							<span className={styles.mode_badge}><ModeIcon mode={vanillaMode}/></span>
							<div>
								<h1>{map.title}</h1>
							</div>
						</div>
						<p className={styles.hero_artist}>{map.artist}</p>
						<nav className={styles.hero_difficulties} aria-label="Beatmap difficulties">
							<div className={styles.difficulty_list}>
								{displayedDifficulties.map((difficulty) =>
									<Link key={`${difficulty.mode}-${difficulty.id}`}
									      className={styles.difficulty_link}
									      data-active={difficulty.id === map.id}
								      aria-label={`${difficulty.mode === ModeNum.mania ? `${Math.round(difficulty.cs)}K, ` : ""}${difficulty.version}, ${difficulty.difficulty.toFixed(2)} stars`}
									      style={{ "--difficulty-color": difficultyColor(difficulty.difficulty) } as CSSProperties}
									      href={`/beatmaps/${difficulty.setId}/${difficulty.id}`}>
									<ModeIcon mode={getVanillaMode(difficulty.mode)}/>
									<span className={styles.difficulty_tooltip} aria-hidden="true">
										{difficulty.mode === ModeNum.mania && <>{Math.round(difficulty.cs)}K · </>}
										{difficulty.version} · ★{difficulty.difficulty.toFixed(2)}
										</span>
									</Link>)}
							</div>
						</nav>
						<div className={styles.map_subline}>
							<span className={styles.difficulty_name}>{map.version}</span>
							{map.mode === ModeNum.mania &&
								<span className={styles.key_count}>{Math.round(map.cs)}K</span>}
							<span className={styles.star_rating}
							      style={{ "--difficulty-color": difficultyColor(map.difficulty) } as CSSProperties}>
								★ {map.difficulty.toFixed(2)}
							</span>
							<span className={styles.mapper}>mapped by <a href={`https://osu.ppy.sh/users/${encodeURIComponent(map.creator)}`}
							                                                   target="_blank"
							                                                   rel="noopener noreferrer">{map.creator}</a></span>
						</div>
						<div className={styles.hero_actions}>
							{map.setId > 0 && <AudioPreview setId={map.setId}/>} 
							{map.setId > 0 && <a href={`https://api.nerinyan.moe/d/${map.setId}`}
							                         target="_blank"
							                         rel="noopener noreferrer">
								<FontAwesome prefix="fas" name="download"/><span>Download</span>
							</a>}
							{map.server === "osu!" && map.setId > 0 && map.id > 0 &&
								<a href={`https://osu.ppy.sh/beatmapsets/${map.setId}#${vanillaMode}/${map.id}`}
								   target="_blank"
								   rel="noopener noreferrer">
									<FontAwesome prefix="fas" name="arrow-up-right-from-square"/><span>osu! page</span>
								</a>}
						</div>
					</div>
					<aside className={styles.hero_sidebar}>
						<div className={styles.difficulty_header}>
							<span>
								<FontAwesome prefix="fad" name="chart-simple"/>
								<strong>Map Overview</strong>
							</span>
							<span className={styles.play_count}>
								<FontAwesome prefix="fas" name="circle-play"/>
								{map.plays.toLocaleString()} plays
							</span>
						</div>
						<div className={styles.hero_overview}>
							<div className={styles.quick_stats}>
								<span><FontAwesome prefix="fad" name="clock"/><small>Total length</small><strong>{formatDuration(map.totalLength)}</strong></span>
								<span><FontAwesome prefix="fad" name="gauge-high"/><small>BPM</small><strong>{Math.round(map.bpm).toLocaleString()}</strong></span>
								<span><FontAwesome prefix="fad" name="link"/><small>Max combo</small><strong>{map.maxCombo.toLocaleString()}<small>x</small></strong></span>
							</div>
							<div className={styles.attribute_grid}>
								{[
									{
										label: map.mode === ModeNum.mania ? "Key count" : "Circle size",
										short: map.mode === ModeNum.mania ? "KEYS" : "CS",
										value: map.cs,
										display: map.mode === ModeNum.mania ? `${Math.round(map.cs)}K` : undefined
									},
									{ label: "HP drain", short: "HP", value: map.hp },
									{ label: "Accuracy", short: "OD", value: map.od },
									{ label: "Approach rate", short: "AR", value: map.ar }
								].map((attribute) =>
									<div key={attribute.short} className={styles.attribute}>
										<span><small>{attribute.short}</small><strong>{attribute.label}</strong><b>{attribute.display ?? attribute.value.toFixed(1)}</b></span>
										<i><span style={{ width: getStatWidth(attribute.value) }}/></i>
									</div>)}
								<div className={classNames(styles.attribute, styles.success_rate)}
								     tabIndex={0}
								     aria-label={`Success rate ${successRate.toFixed(1)}%, ${map.passes.toLocaleString()} of ${map.plays.toLocaleString()} plays`}>
									<span><small>PASS</small><strong>Success rate</strong><b>{successRate.toFixed(1)}%</b></span>
									<i><span style={{ width: `${successRate}%` }}/></i>
									<div className={styles.success_tooltip} aria-hidden="true">
										{map.passes.toLocaleString()} of {map.plays.toLocaleString()} plays
									</div>
								</div>
							</div>
						</div>
					</aside>
				</div>
			</section>

			<div className={styles.container}>
				<section className={classNames(styles.card, styles.ranking)}>
					<div className={styles.ranking_header}>
						<span className={styles.section_heading}>
							<FontAwesome prefix="fad" name="trophy"/>
							<span><small>Leaderboard</small><strong>Score Ranking</strong></span>
						</span>
						<div className={styles.score_mode_controls}>
							{convertScoreModeOptions.length > 0 &&
								<nav className={styles.convert_modes} aria-label="Converted score mode">
									<span className={styles.convert_mode_label}>Mode</span>
									{convertScoreModeOptions.map((option) =>
										<Link key={option.route}
										      data-active={option.mode === selectedScoreMode.mode}
										      aria-label={option.mode === ModeNum.std ? "Standard scores" : `${option.label} convert scores`}
										      title={option.mode === ModeNum.std ? "Standard" : option.label}
										      scroll={false}
										      href={getScoreHref(option)}>
											<ModeIcon mode={getVanillaMode(option.mode)}/>
										</Link>)}
								</nav>}
							<nav className={styles.mode_tabs} aria-label="Score mode">
								{playstyleScoreModeOptions.map((option) =>
									<Link key={option.route}
									      data-active={option.mode === selectedScoreMode.mode}
									      scroll={false}
									      href={getScoreHref(option)}>
										<span>{option.label}</span>
									</Link>)}
							</nav>
						</div>
					</div>
					<nav className={styles.mod_filters} aria-label="Filter scores by mods">
						<span className={styles.mod_filter_label}>
							<FontAwesome prefix="fas" name="filter"/>
							Mods
						</span>
						<div className={styles.mod_filter_buttons}>
							<Link data-active={selectedMods.length === 0}
							      scroll={false}
							      href={getScoreHref(selectedScoreMode, [])}>
								All
							</Link>
							{modFilterOptions.map(({ mod, label, tone }) => {
								if (cyclicSecondMods.has(mod)) return null;
								const secondMod = cyclicModPairs.get(mod);
								if (secondMod) {
									const activeMod = getActiveCyclicMod(mod, secondMod);
									const firstLabel = label ?? mod.toUpperCase();
									const secondLabel = getModFilterLabel(secondMod);
									return <Link key={`${mod}-${secondMod}`}
									             data-active={activeMod !== null}
									             data-tone={tone}
									             aria-label={`Filter by ${firstLabel} or ${secondLabel}`}
									             title={`${firstLabel} → ${secondLabel} → Off`}
									             scroll={false}
									             href={getScoreHref(selectedScoreMode, cycleModFilter(mod, secondMod))}>
										{activeMod === secondMod ? secondLabel : firstLabel}
									</Link>;
								}
								return <Link key={mod}
								             data-active={selectedMods.includes(mod)}
								             data-tone={tone}
								             scroll={false}
								             href={getScoreHref(selectedScoreMode, toggleMod(mod))}>
									{label ?? mod.toUpperCase()}
								</Link>;
							})}
						</div>
					</nav>

					{topScore && <FeaturedScoreCard score={topScore}
					                                rank={1}
					                                mode={selectedScoreMode.route}
					                                mapMaxCombo={map.maxCombo}/>}
					{personalScore && <FeaturedScoreCard score={personalScore.score}
					                                     rank={personalScore.rank}
					                                     mode={selectedScoreMode.route}
					                                     mapMaxCombo={map.maxCombo}
					                                     personal/>}

					{scores.length > 0 ? <div className={styles.score_table_scroller}>
						<table className={styles.score_table}>
							<thead>
								<tr>
									<th>Rank</th><th>Grade</th><th>Score</th><th>Accuracy</th><th>Player</th><th>Combo</th>
									{hitColumns.map(({ label }) => <th key={label}>{label}</th>)}
									<th>PP</th><th>Time</th><th>Mods</th>
								</tr>
							</thead>
							<tbody>
								{scores.map((score, index) =>
									<tr key={score.id}>
										<td className={styles.rank_cell} data-rank={index + 1}>#{index + 1}</td>
										<td>
											<span className={styles.grade_icon} data-grade={score.grade.toLowerCase()}>
												{score.grade.replace(/H$/, "")}
											</span>
										</td>
										<td className={styles.score_cell}>{score.score.toLocaleString()}</td>
										<td className={classNames(styles.accuracy_cell, {
											[styles.perfect_value]: score.accuracy === 100
										})}>{score.accuracy.toFixed(2)}%</td>
										<td className={styles.player_cell}>
											<span className={styles.player_content}>
												<CountryFlag code={score.country} escapeOverflow/>
												<Link href={`/profile/${score.userId}/${selectedScoreMode.route}`}>{score.name}</Link>
											</span>
										</td>
										<td className={classNames({
											[styles.perfect_value]: score.maxCombo === map.maxCombo
										})}>{score.maxCombo.toLocaleString()}x</td>
										{hitColumns.map(({ label, getValue }) => <td key={label}>{getValue(score)}</td>)}
										<td className={styles.pp_cell}>{Math.round(score.pp).toLocaleString()}<small>pp</small></td>
										<td><time dateTime={score.playTime.toISOString()} title={score.playTime.toLocaleString("en-US")}>{formatRelativeTime(score.playTime)}</time></td>
										<td className={styles.mods_cell}><ModsList mods={score.mods}/></td>
									</tr>)}
							</tbody>
						</table>
					</div> : <div className={styles.empty_scores}>
						<span><FontAwesome prefix="fad" name="compact-disc"/></span>
						<strong>{selectedMods.length > 0 ? "No matching scores" : "No scores yet"}</strong>
						<p>{selectedMods.length > 0
							? "Try changing or clearing the selected mods."
							: `Be the first player to set a score in ${selectedScoreMode.label}.`}</p>
					</div>}
				</section>
			</div>
		</div>
	);
}
