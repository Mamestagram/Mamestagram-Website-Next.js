import classNames from "classnames";
import type { PlayerScoreMap, PlayerMostPlayedMap } from "@/database/profile";
import { ScoreScope } from "@/database/profile";
import { BeatmapStatus } from "@/lib/beatmap-status";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/profile.module.css";

export default function PlayerScoreValue({ i, map, scope, isDans }: {
	i: number,
	map: PlayerScoreMap | PlayerMostPlayedMap,
	scope: ScoreScope,
	isDans: boolean
}) {
	switch (scope) {
		case ScoreScope.bestPP:
		case ScoreScope.firstPlace:
		case ScoreScope.recentPlayed:
			const scoreMap = map as PlayerScoreMap;
			return (
				<>
					<span className={classNames(styles.recorded, { [styles.not_taken]: scoreMap.status !== BeatmapStatus.ranked && scoreMap.status !== BeatmapStatus.approved })}>
						{(scoreMap.status !== BeatmapStatus.ranked && scoreMap.status !== BeatmapStatus.approved && "-") ||
							<><span className={styles.score_numeric_value}>{Math.round(scoreMap.pp).toLocaleString()}</span><span className={styles.pp_label}>pp</span></>}
					</span>
					{!isDans && scope === ScoreScope.bestPP &&
						<span className={styles.weighted}>
							<span className={styles.auxiliary_label}>weighted</span>
							<span className={styles.score_numeric_value}>{Math.round(scoreMap.pp * 0.95 ** i).toLocaleString()}</span><span className={styles.pp_label}>pp</span>
						</span>}
					{scope !== ScoreScope.bestPP && scoreMap.status === BeatmapStatus.loved &&
						<span className={styles.loved}>Loved</span>}
				</>
			);
		case ScoreScope.mostPlayed:
			const mostPlayedMap = map as PlayerMostPlayedMap;
			return (
				<span className={classNames(styles.recorded)}>
					<FontAwesome prefix="fad" name="play"/>
					<span className={styles.score_numeric_value}>{mostPlayedMap.plays.toLocaleString()}</span>
				</span>
			);
	}
}
