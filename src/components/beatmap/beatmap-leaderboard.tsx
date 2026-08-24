import classNames from "classnames";
import Link from "next/link";
import { notFound } from "next/navigation";
import FeaturedScoreCard from "@/components/beatmap/featured-score-card";
import ScoreMods, { isKnownMod, type ModTone } from "@/components/beatmap/score-mods";
import FloatingCountryFlag from "@/components/floating-country-flag";
import FontAwesome from "@/components/font-awesome";
import FormattedNumber from "@/components/formatted-number";
import ModeIcon from "@/components/mode-icon";
import ReplayViewer from "@/components/replay-viewer";
import {
	getBeatmapScores,
	getBeatmapUserScore,
	type Beatmap,
	type BeatmapScore
} from "@/database/beatmap";
import { getVanillaMode, ModeNum, OsuMode } from "@/lib/mode";
import { Mods } from "@/lib/mods";
import { getProfileCosmeticsMap } from "@/lib/profile-cosmetics";
import { getCurrentUser } from "@/lib/session";
import styles from "@s/beatmap.module.css";

export type BeatmapLeaderboardSearchParams = {
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

type ModFilterOption = {
	mod: Mods,
	label?: string,
	tone: ModTone
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
				{ label: "300", getValue: (score) => (score.n300 + score.nGeki).toLocaleString() },
				{ label: "100", getValue: (score) => (score.n100 + score.nKatu).toLocaleString() },
				{ label: "50", getValue: (score) => score.n50.toLocaleString() },
				{ label: "Miss", getValue: (score) => score.nMiss.toLocaleString() }
			];
	}
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

export default async function BeatmapLeaderboard({ map, searchParams }: Readonly<{
	map: Beatmap,
	searchParams: BeatmapLeaderboardSearchParams
}>) {
	const baseDomain = process.env.BASE_DOMAIN;
	if (!baseDomain) throw new Error("BASE_DOMAIN is not configured");
	const scoreModeOptions = getScoreModeOptions(map.mode);
	const convertScoreModeOptions = map.mode === ModeNum.std
		? scoreModeOptions.filter(({ mode }) => [ModeNum.std, ModeNum.taiko, ModeNum.ctb, ModeNum.mania].includes(mode))
		: [];
	const playstyleScoreModeOptions = map.mode === ModeNum.std
		? scoreModeOptions.filter(({ mode }) => [ModeNum.std, ModeNum.rxstd, ModeNum.apstd].includes(mode))
		: scoreModeOptions;
	const requestedMode = Array.isArray(searchParams.mode) ? searchParams.mode[0] : searchParams.mode;
	if (map.mode !== ModeNum.std
		&& requestedMode
		&& !scoreModeOptions.some(({ route }) => route === requestedMode)) notFound();
	const selectedScoreMode = scoreModeOptions.find(({ route }) => route === requestedMode) ?? scoreModeOptions[0];
	const selectedBaseScoreMode = getBaseScoreMode(selectedScoreMode.mode);
	const modFilterOptions = getModFilterOptions(selectedBaseScoreMode);
	const allowedFilterMods = new Set(modFilterOptions.map(({ mod }) => mod));
	const requestedMods = Array.isArray(searchParams.mods) ? searchParams.mods[0] : searchParams.mods;
	const requestedModTokens = (requestedMods ?? "")
		.toLowerCase()
		.replaceAll(/[^a-z0-9]/g, "")
		.match(/.{2}/g) ?? [];
	const parsedSelectedMods: Mods[] = [];
	requestedModTokens.forEach((mod) => {
		if (isKnownMod(mod) && allowedFilterMods.has(mod) && !parsedSelectedMods.includes(mod))
			parsedSelectedMods.push(mod);
	});
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
	const selectedModsQuery = selectedMods.map((mod) => mod.toLowerCase()).join("");
	const [scores, currentUser] = await Promise.all([
		getBeatmapScores(
			map.id,
			selectedScoreMode.mode,
			selectedMods.length > 0 ? selectedModsQuery : undefined
		),
		getCurrentUser()
	]);
	const getScoreHref = (mode: ScoreModeOption, mods: Mods[] = selectedMods) => {
		const hrefQuery: string[] = [];
		if (mode !== scoreModeOptions[0]) hrefQuery.push(`mode=${mode.route}`);
		if (mods.length > 0) hrefQuery.push(`mods=${mods.join("")}`);
		const search = hrefQuery.join("&");
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
	const topScore = scores[0];
	let personalScore: { score: BeatmapScore, rank: number } | null = null;
	if (currentUser.isLoggedIn && currentUser.id) {
		const apiScoreIndex = scores.findIndex((score) => score.userId === currentUser.id);
		if (apiScoreIndex >= 0) {
			personalScore = { score: scores[apiScoreIndex], rank: apiScoreIndex + 1 };
		}
		else if (selectedMods.length === 0) {
			const databaseScore = await getBeatmapUserScore(map.md5, selectedScoreMode.mode, currentUser.id);
			if (databaseScore) personalScore = { score: databaseScore, rank: databaseScore.rank };
		}
		if (personalScore && topScore?.userId === currentUser.id) personalScore = null;
	}
	const featuredCosmetics = await getProfileCosmeticsMap([
		...(topScore ? [topScore.userId] : []),
		...(personalScore ? [personalScore.score.userId] : [])
	]);

	return (
		<div className={styles.container}>
			<section className={classNames(styles.card, styles.ranking)} data-page-enter="box">
				<div className={styles.ranking_header}>
					<span className={styles.section_heading}>
						<FontAwesome prefix="fad" name="trophy"/>
						<span><strong>Score Ranking</strong></span>
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
				                                cosmetics={featuredCosmetics.get(topScore.userId) ?? null}
				                                rank={1}
				                                mode={selectedScoreMode.route}
				                                mapMaxCombo={map.maxCombo}
				                                achievedTime={formatRelativeTime(topScore.playTime)}
				                                replayLabel={`${topScore.name} — ${map.artist} — ${map.title}`}
				                                replayUrl={`https://render.${baseDomain}/embed/${topScore.id}`}
				                                baseDomain={baseDomain}/>}
				{personalScore && <FeaturedScoreCard score={personalScore.score}
				                                     cosmetics={featuredCosmetics.get(personalScore.score.userId) ?? null}
				                                     rank={personalScore.rank}
				                                     mode={selectedScoreMode.route}
				                                     mapMaxCombo={map.maxCombo}
				                                     achievedTime={formatRelativeTime(personalScore.score.playTime)}
				                                     replayLabel={`${personalScore.score.name} — ${map.artist} — ${map.title}`}
				                                     replayUrl={`https://render.${baseDomain}/embed/${personalScore.score.id}`}
				                                     baseDomain={baseDomain}
				                                     personal/>}

				{scores.length > 0 ? <div className={styles.score_table_scroller}>
					<table className={styles.score_table}>
						<thead>
							<tr>
								<th>Rank</th><th>Grade</th><th>Score</th><th>Accuracy</th><th>Player</th><th>Combo</th>
								{hitColumns.map(({ label }) => <th key={label}>{label}</th>)}
								<th>PP</th><th>Time</th><th>Mods</th><th>Replay</th>
							</tr>
						</thead>
						<tbody>
							{scores.map((score, index) =>
								<tr key={score.id} data-rendering-item="compact">
									<td className={styles.rank_cell} data-rank={index + 1}>#{index + 1}</td>
									<td>
										<span className={styles.grade_icon} data-grade={score.grade.toLowerCase()}>
											{score.grade.replace(/H$/, "")}
										</span>
									</td>
									<td className={styles.score_cell}><FormattedNumber value={score.score}/></td>
									<td className={classNames(styles.accuracy_cell, {
										[styles.perfect_value]: score.accuracy === 100
									})}>{score.accuracy.toFixed(2)}%</td>
									<td className={styles.player_cell}>
										<span className={styles.player_content}>
											<FloatingCountryFlag className={styles.score_country_flag}
											                     code={score.country}/>
											<Link href={`/profile/${score.userId}/${selectedScoreMode.route}`}>{score.name}</Link>
										</span>
									</td>
									<td className={classNames({
										[styles.perfect_value]: score.maxCombo === map.maxCombo
									})}><FormattedNumber value={score.maxCombo}/>x</td>
									{hitColumns.map(({ label, getValue }) =>
										<td key={label}><FormattedNumber value={getValue(score)}/></td>)}
									<td className={styles.pp_cell}><FormattedNumber value={Math.round(score.pp)}/><small>pp</small></td>
									<td><time dateTime={score.playTime.toISOString()} title={score.playTime.toLocaleString("en-US")}>{formatRelativeTime(score.playTime)}</time></td>
									<td className={styles.mods_cell}><ScoreMods mods={score.mods}/></td>
									<td className={styles.replay_cell}>
										{score.id > 0
											? <ReplayViewer className={styles.table_replay_button}
											                label={`${score.name} — ${map.artist} — ${map.title}`}
											                replayUrl={`https://render.${baseDomain}/embed/${score.id}`}
											                buttonLabel={`Watch ${score.name}'s replay`}>
												<FontAwesome prefix="fas" name="circle-play"/>
											</ReplayViewer>
											: <span className={styles.replay_unavailable}>—</span>}
									</td>
								</tr>)}
						</tbody>
					</table>
				</div> : <div className={styles.empty_scores} role="status">
					<span><FontAwesome prefix="fad" name="compact-disc"/></span>
					<strong>{selectedMods.length > 0 ? "No matching scores" : "No scores yet"}</strong>
					<p>{selectedMods.length > 0
						? "Try changing or clearing the selected mods."
						: `Be the first player to set a score in ${selectedScoreMode.label}.`}</p>
				</div>}
			</section>
		</div>
	);
}
