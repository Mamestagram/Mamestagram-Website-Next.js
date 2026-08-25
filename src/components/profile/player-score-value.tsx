import classNames from "classnames";
import type { PlayerScoreMap, PlayerMostPlayedMap } from "@/database/profile";
import { ScoreScope } from "@/database/profile";
import { BeatmapStatus } from "@/lib/beatmap-status";
import FontAwesome from "@/components/font-awesome";
import FormattedNumber from "@/components/formatted-number";
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
					<span
						className={classNames(styles.recorded, { [styles.not_taken]: scoreMap.status !== BeatmapStatus.ranked && scoreMap.status !== BeatmapStatus.approved })}>
						{(scoreMap.status !== BeatmapStatus.ranked && scoreMap.status !== BeatmapStatus.approved && "-") ||
							<><span><FormattedNumber value={Math.round(scoreMap.pp)}/></span><span
								className={styles.pp_label}>pp</span></>}
					</span>
					{!isDans && scope === ScoreScope.bestPP &&
						<span className={styles.weighted}>
							(<FormattedNumber value={Math.round(scoreMap.pp * 0.95 ** i)}/>pp)
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
					<span><FormattedNumber value={mostPlayedMap.plays}/></span>
				</span>
			);
	}
}
