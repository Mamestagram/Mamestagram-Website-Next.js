import classNames from "classnames";
import Image from "next/image";
import type { PlayerMostPlayedMap, PlayerScoreMap } from "@/database/profile";
import { ScoreScope, getMostPlayedMaps, getPlayerScores } from "@/database/profile";
import { ModeNum } from "@/lib/mode";
import FontAwesome from "@/components/font-awesome";
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
			<ScoreList count={playerScores.length}>
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
				{playerScores.map((map, i) =>
					<div key={i}
					     className={classNames(
							 styles.score,
						     { [styles.best_pp]: scope === ScoreScope.bestPP },
						     { [styles.most_played]: scope === ScoreScope.mostPlayed })}>
						{map.set_id > 0 &&
							<Image className={styles.map_bg}
							       src={`https://assets.ppy.sh/beatmaps/${map.set_id}/covers/cover.jpg?`}
							       alt="map bg"
							       fill
							       loading="eager"
							       unoptimized
							       draggable={false}
							       sizes="(max-width: 768px) 100vw, 50vw"/>}
						{scope !== ScoreScope.mostPlayed &&
							<span className={styles.score_identity}>
								<span className={styles.grade}
								      data-grade={(map as PlayerScoreMap).grade.toLowerCase()}>
									{(map as PlayerScoreMap).grade}
								</span>
							</span>}
						<div className={styles.map_meta}>
							<h2 className={styles.map_heading}>
								<span className={styles.artist}>{map.artist}</span>
								<span className={styles.heading_separator}>—</span>
								<span className={styles.title}>{map.title}</span>
							</h2>
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
					</div>
				)}
			</ScoreList>
		</details>
	);
}
