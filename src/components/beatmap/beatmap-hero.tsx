import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import AudioPreview from "@/components/beatmap/audio-preview";
import FontAwesome from "@/components/font-awesome";
import FormattedNumber from "@/components/formatted-number";
import ModeIcon from "@/components/mode-icon";
import type { Beatmap, BeatmapDifficulty } from "@/database/beatmap";
import { BeatmapStatus } from "@/lib/beatmap-status";
import { getVanillaMode, ModeNum } from "@/lib/mode";
import styles from "@s/beatmap.module.css";

const statusMeta: Record<number, { label: string, tone: string }> = {
	[BeatmapStatus.notSubmitted]: { label: "Not submitted", tone: "unsubmitted" },
	[BeatmapStatus.graveyard]: { label: "Graveyard", tone: "graveyard" },
	[BeatmapStatus.updateAvailable]: { label: "Pending", tone: "pending" },
	[BeatmapStatus.ranked]: { label: "Ranked", tone: "ranked" },
	[BeatmapStatus.approved]: { label: "Approved", tone: "approved" },
	[BeatmapStatus.qualified]: { label: "Qualified", tone: "qualified" },
	[BeatmapStatus.loved]: { label: "Loved", tone: "loved" }
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

const formatDuration = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	return `${minutes}:${Math.max(0, seconds % 60).toString().padStart(2, "0")}`;
};

const getStatWidth = (value: number) => `${Math.min(100, Math.max(0, value * 10))}%`;

const includeCurrentDifficulty = (map: Beatmap, difficulties: BeatmapDifficulty[]) => {
	if (difficulties.some((difficulty) => difficulty.id === map.id)) return difficulties;
	return [...difficulties, {
		id: map.id,
		setId: map.setId,
		version: map.version,
		mode: map.mode,
		difficulty: map.difficulty,
		cs: map.cs
	}].sort((a, b) => a.mode - b.mode || a.difficulty - b.difficulty || a.id - b.id);
};

export default async function BeatmapHero({ map, difficulties }: Readonly<{
	map: Beatmap,
	difficulties: Promise<BeatmapDifficulty[]>
}>) {
	const displayedDifficulties = includeCurrentDifficulty(map, await difficulties);
	const status = statusMeta[map.status] ?? { label: "Unknown", tone: "unknown" };
	const successRate = map.plays > 0 ? map.passes / map.plays * 100 : 0;
	const vanillaMode = getVanillaMode(map.mode);
	const cover = map.server === "osu!" && map.setId > 0
		? `https://assets.ppy.sh/beatmaps/${map.setId}/covers/cover.jpg`
		: "/images/banner/maplist.jpg";
	
	return (
		<section className={styles.hero}>
			<div className={styles.hero_backdrop}>
				<Image className={styles.hero_image}
				       src={cover}
				       alt={`${map.artist} — ${map.title} cover`}
				       fill
				       priority
				       unoptimized
				       draggable={false}
				       sizes="100vw"/>
				<div className={styles.hero_shade}/>
			</div>
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
						<div className={styles.hero_title}>
							<h1 tabIndex={0} aria-describedby="beatmap-title-tooltip">{map.title}</h1>
							<span id="beatmap-title-tooltip" className={styles.title_tooltip} role="tooltip">
								{map.title}
							</span>
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
							<FontAwesome prefix="fas" name="star"/>
							<span>{map.difficulty.toFixed(2)}</span>
						</span>
						<span className={styles.mapper}>mapped by <a
							href={`https://osu.ppy.sh/users/${encodeURIComponent(map.creator)}`}
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
				<aside className={styles.hero_sidebar} data-page-enter="box">
					<div className={styles.difficulty_header}>
						<span>
							<FontAwesome prefix="fad" name="chart-simple"/>
							<strong>Map Overview</strong>
						</span>
						<span className={styles.play_count}>
							<FontAwesome prefix="fas" name="circle-play"/>
							<FormattedNumber value={map.plays}/> plays
						</span>
					</div>
					<div className={styles.hero_overview}>
						<div className={styles.quick_stats}>
							<span><FontAwesome prefix="fad"
							                   name="clock"/><small>Length</small><strong>{formatDuration(map.totalLength)}</strong></span>
							<span><FontAwesome prefix="fad"
							                   name="gauge-high"/><small>BPM</small><strong><FormattedNumber
								value={Math.round(map.bpm)}/></strong></span>
							<span><FontAwesome prefix="fad"
							                   name="link"/><small>Max combo</small><strong><FormattedNumber
								value={map.maxCombo}/><small>x</small></strong></span>
						</div>
						<div className={styles.attribute_grid}>
							{[
								{
									label: map.mode === ModeNum.mania ? "Key count" : "Circle size",
									value: map.cs,
									display: map.mode === ModeNum.mania ? `${Math.round(map.cs)}K` : undefined
								},
								{ label: "HP drain", value: map.hp },
								{ label: "Accuracy", value: map.od },
								{ label: "Approach rate", value: map.ar }
							].map((attribute) =>
								<div key={attribute.label} className={styles.attribute}>
									<span><strong>{attribute.label}</strong><b>{attribute.display ?? attribute.value.toFixed(1)}</b></span>
									<i><span style={{ width: getStatWidth(attribute.value) }}/></i>
								</div>)}
							<div className={classNames(styles.attribute, styles.success_rate)}
							     tabIndex={0}
							     aria-label={`Success rate ${successRate.toFixed(1)}%, ${map.passes.toLocaleString()} of ${map.plays.toLocaleString()} plays`}>
								<span><strong>Success rate</strong><b>{successRate.toFixed(1)}%</b></span>
								<i><span style={{ width: `${successRate}%` }}/></i>
								<div className={styles.success_tooltip} aria-hidden="true">
									<FormattedNumber value={map.passes}/> of <FormattedNumber value={map.plays}/> plays
								</div>
							</div>
						</div>
					</div>
				</aside>
			</div>
		</section>
	);
}
