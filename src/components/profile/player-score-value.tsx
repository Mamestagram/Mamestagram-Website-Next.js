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
			const status = Number(scoreMap.status);
			const performance = Number(scoreMap.pp);
			const isLoved = status === BeatmapStatus.loved;
			const hasPerformance = Number.isFinite(performance)
				&& (performance > 0
					|| status === BeatmapStatus.ranked
					|| status === BeatmapStatus.approved
					|| isLoved);
			return (
				<>
					<span
						className={classNames(styles.recorded, { [styles.not_taken]: !hasPerformance })}>
						{(!hasPerformance && "-") ||
							<><span><FormattedNumber value={Math.round(performance)}/></span><span
								className={styles.pp_label}>pp</span></>}
					</span>
					{!isDans && scope === ScoreScope.bestPP && hasPerformance &&
						<span className={styles.weighted}>
							(<FormattedNumber value={Math.round(performance * 0.95 ** i)}/>pp)
						</span>}
					{scope !== ScoreScope.bestPP && isLoved &&
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
