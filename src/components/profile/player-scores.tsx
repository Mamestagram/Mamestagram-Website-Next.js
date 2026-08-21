import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import type { PlayerMostPlayedMap, PlayerScoreMap } from "@/database/profile";
import { ScoreScope, getMostPlayedMaps, getPlayerScores } from "@/database/profile";
import { ModeNum } from "@/lib/mode";
import FontAwesome from "@/components/font-awesome";
import PlayerScoreCard from "@/components/profile/player-score-card";
import PlayerScoreHeading from "@/components/profile/player-score-heading";
import PlayerScoreValue from "@/components/profile/player-score-value";
import ScoreList from "@/components/profile/score-list";
import styles from "@s/profile.module.css";

export default async function PlayerScores({ scope, id, mode, isDans }: {
	scope: ScoreScope,
	id: number,
	mode: ModeNum,
	isDans: boolean
}) {
	let playerScores: PlayerScoreMap[] | PlayerMostPlayedMap[];
	switch (scope) {
		case ScoreScope.bestPP:
		case ScoreScope.firstPlace:
		case ScoreScope.recentPlayed:
			playerScores = await getPlayerScores(scope, id, mode, isDans);
			break;
		case ScoreScope.mostPlayed:
			playerScores = await getMostPlayedMaps(id, mode, isDans);
			break;
	}
	const sectionTitle = {
		[ScoreScope.bestPP]: "Best Performance",
		[ScoreScope.firstPlace]: "First Place Ranks",
		[ScoreScope.mostPlayed]: "Most Played Maps",
		[ScoreScope.recentPlayed]: "Recent Played Maps"
	}[scope];
	const baseDomain = process.env.BASE_DOMAIN;
	if (!baseDomain) throw new Error("BASE_DOMAIN is not configured");

	return (
		<details className={styles.score_details} open>
			<summary className={styles.score_summary}>
				<h1 className={styles.section_title}>
					<span className={styles.section_title_label}>
						{(scope === ScoreScope.bestPP && <><FontAwesome prefix="fad" name="chart-bar"/>Best Performance</>) ||
							(scope === ScoreScope.firstPlace && <><FontAwesome prefix="fad" name="medal"/>First Place Ranks</>) ||
							(scope === ScoreScope.mostPlayed && <><FontAwesome prefix="fad" name="circle-play"/>Most Played Maps</>) ||
							(scope === ScoreScope.recentPlayed && <><FontAwesome prefix="fadr" name="calendar-days"/>Recent Played Maps</>)}
					</span>
					<FontAwesome className={styles.collapse_icon} prefix="fas" name="chevron-down"/>
				</h1>
			</summary>
			<ScoreList count={playerScores.length} title={sectionTitle}>
				{playerScores.length === 0 &&
					<div className={styles.no_scores} role="status">
						<span className={styles.empty_score_icon}>
							<FontAwesome prefix="fad" name="compact-disc"/>
						</span>
						<span className={styles.empty_score_copy}>
							<strong>No scores available</strong>
							<small>Nothing has been recorded in this category yet.</small>
						</span>
					</div>}
				{playerScores.map((map, i) => {
					const className = classNames(
						styles.score,
						{ [styles.best_pp]: scope === ScoreScope.bestPP },
						{ [styles.most_played]: scope === ScoreScope.mostPlayed }
					);
					const content = <>
						{map.set_id > 0 &&
							<Image className={styles.map_bg}
							       src={`https://assets.ppy.sh/beatmaps/${map.set_id}/covers/cover.jpg?`}
							       alt="map bg"
							       fill
							       unoptimized
							       draggable={false}
							       sizes="(max-width: 768px) 100vw, 50vw"/>}
						{scope !== ScoreScope.mostPlayed &&
							<span className={styles.score_identity}>
								<span className={styles.grade}
								      data-grade={(map as PlayerScoreMap).grade.toLowerCase()}>
									{(map as PlayerScoreMap).grade.replace(/H$/, "")}
								</span>
							</span>}
						<div className={styles.map_meta}>
							<PlayerScoreHeading artist={map.artist} title={map.title}/>
							<p className={styles.map_details}>
								<span className={styles.difficulty}>
									<FontAwesome prefix="fas" name="layer-group"/>
									<span className={styles.difficulty_name}>{map.version}</span>
								</span>
								<span className={styles.mapper}>mapped by <strong>{map.creator}</strong></span>
							</p>
						</div>
						<p className={styles.score_value}>
							<span className={styles.metric_content}>
								<PlayerScoreValue i={i} map={map} scope={scope} isDans={isDans}/>
							</span>
						</p>
					</>;
					if (map.set_id <= 0 || map.id <= 0)
						return <div key={`${map.set_id}-${map.id}-${i}`}
						            className={className}
						            data-rendering-item="medium">{content}</div>;
					if (scope === ScoreScope.mostPlayed)
						return <Link key={`${map.set_id}-${map.id}-${i}`}
						             className={className}
						             data-rendering-item="medium"
						             aria-label={`${map.artist} — ${map.title}`}
						             href={`/beatmaps/${map.set_id}/${map.id}`}>
							{content}
						</Link>;

					const scoreMap = map as PlayerScoreMap;
					return <PlayerScoreCard key={`${map.set_id}-${map.id}-${scoreMap.score_id}-${i}`}
					                        className={className}
					                        label={`${map.artist} — ${map.title}`}
					                        beatmapHref={`/beatmaps/${map.set_id}/${map.id}`}
					                        replayUrl={`https://render.${baseDomain}/embed/${scoreMap.score_id}`}>
						{content}
					</PlayerScoreCard>;
				})}
			</ScoreList>
		</details>
	);
}
