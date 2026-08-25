"use client";

import Image from "next/image";
import Link from "next/link";
import FontAwesome from "@/components/font-awesome";
import { BeatmapStatus } from "@/lib/beatmap-status";
import { getVanillaMode, modeAbbreviation, type ModeNum } from "@/lib/mode";
import type { SearchBeatmap } from "@/lib/search";
import styles from "@s/header-search.module.css";

const beatmapStatusLabels: Record<number, string> = {
	[BeatmapStatus.notSubmitted]: "Not submitted",
	[BeatmapStatus.graveyard]: "Graveyard",
	[BeatmapStatus.updateAvailable]: "Pending update",
	[BeatmapStatus.ranked]: "Ranked",
	[BeatmapStatus.approved]: "Approved",
	[BeatmapStatus.qualified]: "Qualified",
	[BeatmapStatus.loved]: "Loved"
};

export default function SearchBeatmapList({ items: beatmaps, columns = 1, onSelect }: Readonly<{
	items: SearchBeatmap[],
	columns?: 1 | 2,
	onSelect?: () => void
}>) {
	return (
		<ul className={styles.beatmap_result_list} data-columns={columns}>
			{beatmaps.map((beatmap) => {
				const primaryDifficulty = beatmap.difficulties.at(0);
				if (!primaryDifficulty) return null;
				
				return (
					<li key={beatmap.setId} data-rendering-item="large">
						<article className={styles.beatmap_result_card}>
							<Link className={styles.beatmap_primary}
							      href={`/beatmaps/${beatmap.setId}/${primaryDifficulty.id}`}
							      onClick={onSelect}>
								<span className={styles.beatmap_cover}>
									<Image src={`https://assets.ppy.sh/beatmaps/${beatmap.setId}/covers/list@2x.jpg`}
									       alt={`${beatmap.artist} — ${beatmap.title} cover`}
									       fill
									       sizes="76px"
									       draggable={false}/>
								</span>
								<span className={styles.beatmap_identity}>
									<strong title={beatmap.title}>{beatmap.title}</strong>
									<small title={`${beatmap.artist} · ${beatmap.creator}`}>
										{beatmap.artist} <span>by {beatmap.creator}</span>
									</small>
								</span>
								<span className={styles.beatmap_meta}>
									<small>{beatmapStatusLabels[primaryDifficulty.status] ?? "Unknown"}</small>
								</span>
								<FontAwesome className={styles.open_icon} prefix="fas" name="chevron-right"/>
							</Link>
							<div className={styles.beatmap_difficulties}
							     aria-label={`${beatmap.title} difficulties`}>
								{beatmap.difficulties.map((difficulty) => {
									const status = beatmapStatusLabels[difficulty.status] ?? "Unknown";
									const mode = difficulty.mode as ModeNum;
									return (
										<Link key={difficulty.id}
										      className={styles.beatmap_difficulty}
										      href={`/beatmaps/${beatmap.setId}/${difficulty.id}`}
										      title={`${difficulty.version} · ${difficulty.difficulty.toFixed(2)} stars · ${status}`}
										      onClick={onSelect}>
											<span>{difficulty.version}</span>
											<span className={styles.beatmap_mode}
											      role="img"
											      aria-label={modeAbbreviation(mode)}
											      title={modeAbbreviation(mode)}>
												<i className={`mode-icon mode-${getVanillaMode(mode)}`}
												   aria-hidden="true"></i>
											</span>
											<strong>
												<FontAwesome prefix="fas" name="star"/>
												{difficulty.difficulty.toFixed(2)}
											</strong>
										</Link>
									);
								})}
							</div>
						</article>
					</li>
				);
			})}
		</ul>
	);
}
