import classNames from "classnames";
import Image from "next/image";
import type { PlayerMostPlayedMap, PlayerScoreMap } from "@/database/profile";
import { ScoreScope, getMostPlayedMaps, getPlayerScores } from "@/database/profile";
import { ModeNum } from "@/lib/mode";
import FontAwesome from "@/components/font-awesome";
import PlayerScoreValue from "@/components/profile/player-score-value";
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
		<>
			<h1 className={styles.section_title}>
				{(scope === ScoreScope.bestPP && <><FontAwesome prefix="fad" name="chart-bar"/>Best Performance</>) ||
					(scope === ScoreScope.firstPlace && <><FontAwesome prefix="fad" name="medal"/>First Place Ranks</>) ||
					(scope === ScoreScope.mostPlayed && <><FontAwesome prefix="fad" name="circle-play"/>Most Played Maps</>) ||
					(scope === ScoreScope.recentPlayed && <><FontAwesome prefix="fadr" name="calendar-days"/>Recent Played Maps</>)}
			</h1>
			<div className={styles.score_list}>
				{playerScores.length === 0 && <h2 className={styles.no_scores}>(No scores available)</h2>}
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
							<span className={styles.grade}>
								<Image src={`/images/grade/${(map as PlayerScoreMap).grade}.png`}
								       alt="grade"
								       fill
								       draggable={false}
								       sizes="(max-width: 768px) 100vw, 50vw"/>
							</span>}
						<span className={styles.meta}>
							<h2>
								<span className={styles.title}>{map.title}</span>
								<span className={styles.version}>{map.version}</span>
							</h2>
							<p>mapped by {map.creator}</p>
						</span>
						<p className={styles.score_value}>
							<PlayerScoreValue i={i} map={map} scope={scope} isDans={isDans}/>
						</p>
					</div>
				)}
			</div>
		</>
	);
}