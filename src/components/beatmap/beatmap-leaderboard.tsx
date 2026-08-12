import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import CountryFlag from "@/components/country-flag";
import FontAwesome from "@/components/font-awesome";
import ModeIcon from "@/components/mode-icon";
import {
	getBeatmapScores,
	getBeatmapUserScore,
	type Beatmap,
	type BeatmapScore
} from "@/database/beatmap";
import { getVanillaMode, ModeNum, OsuMode } from "@/lib/mode";
import { ModNum, Mods } from "@/lib/mods";
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

type ModTone = "easy" | "hard" | "other";

type ModFilterOption = {
	mod: Mods,
	label?: string,
	tone: ModTone
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

function ModsList({ mods }: Readonly<{ mods: number }>) {
	const scoreMods = getMods(mods);
	if (scoreMods.length === 0) return <span className={styles.no_mod} data-tone="other">NM</span>;
	return (
		<span className={styles.mod_list}>
			{scoreMods.map(({ mod }) =>
				<span key={mod} className={styles.mod_badge} data-tone={getModTone(mod)}>
					{mod.toUpperCase()}
				</span>)}
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
			<span className={styles.top_metric}>
				<small>Total score</small>
				<strong><span className={styles.top_metric_value}>{score.score.toLocaleString()}</span></strong>
			</span>
			<span className={styles.top_metric}>
				<small>Accuracy</small>
				<strong className={classNames({ [styles.perfect_value]: score.accuracy === 100 })}>
					<span className={styles.top_metric_value}>{score.accuracy.toFixed(2)}%</span>
				</strong>
			</span>
			<span className={styles.top_metric}>
				<small>Max combo</small>
				<strong className={classNames({ [styles.perfect_value]: score.maxCombo === mapMaxCombo })}>
					<span className={styles.top_metric_value}>{score.maxCombo.toLocaleString()}x</span>
				</strong>
			</span>
			<span className={classNames(styles.top_metric, styles.top_pp)}>
				<small>Performance</small>
				<strong><span className={styles.top_metric_value}>{Math.round(score.pp).toLocaleString()}<small>pp</small></span></strong>
			</span>
			<ModsList mods={score.mods}/>
		</div>
	);
}

export default async function BeatmapLeaderboard({ map, searchParams }: Readonly<{
	map: Beatmap,
	searchParams: BeatmapLeaderboardSearchParams
}>) {
	const scoreModeOptions = getScoreModeOptions(map.mode);
	const convertScoreModeOptions = map.mode === ModeNum.std
		? scoreModeOptions.filter(({ mode }) => [ModeNum.std, ModeNum.taiko, ModeNum.ctb, ModeNum.mania].includes(mode))
		: [];
	const playstyleScoreModeOptions = map.mode === ModeNum.std
		? scoreModeOptions.filter(({ mode }) => [ModeNum.std, ModeNum.rxstd, ModeNum.apstd].includes(mode))
		: scoreModeOptions;
	const requestedMode = Array.isArray(searchParams.mode) ? searchParams.mode[0] : searchParams.mode;
	const selectedScoreMode = scoreModeOptions.find(({ route }) => route === requestedMode) ?? scoreModeOptions[0];
	const selectedBaseScoreMode = getBaseScoreMode(selectedScoreMode.mode);
	const modFilterOptions = getModFilterOptions(selectedBaseScoreMode);
	const allowedFilterMods = new Set(modFilterOptions.map(({ mod }) => mod));
	const requestedMods = Array.isArray(searchParams.mods) ? searchParams.mods[0] : searchParams.mods;
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
	const [allScores, currentUser] = await Promise.all([
		getBeatmapScores(map.id, selectedScoreMode.mode),
		getCurrentUser()
	]);
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
									<td className={classNames(styles.score_cell, styles.score_data_cell)}>{score.score.toLocaleString()}</td>
									<td className={classNames(styles.accuracy_cell, styles.score_data_cell, {
										[styles.perfect_value]: score.accuracy === 100
									})}>{score.accuracy.toFixed(2)}%</td>
									<td className={styles.player_cell}>
										<span className={styles.player_content}>
											<CountryFlag code={score.country} escapeOverflow/>
											<Link href={`/profile/${score.userId}/${selectedScoreMode.route}`}>{score.name}</Link>
										</span>
									</td>
									<td className={classNames(styles.score_data_cell, {
										[styles.perfect_value]: score.maxCombo === map.maxCombo
									})}>{score.maxCombo.toLocaleString()}x</td>
									{hitColumns.map(({ label, getValue }) => <td className={styles.score_data_cell} key={label}>{getValue(score)}</td>)}
									<td className={classNames(styles.pp_cell, styles.score_data_cell)}>{Math.round(score.pp).toLocaleString()}<small>pp</small></td>
									<td className={styles.score_data_cell}><time dateTime={score.playTime.toISOString()} title={score.playTime.toLocaleString("en-US")}>{formatRelativeTime(score.playTime)}</time></td>
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
	);
}
