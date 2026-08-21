import classNames from "classnames";
import { SortBy } from "@/database/leaderboard";
import styles from "@s/leaderboard.module.css";

export default function RankingHeader({ sortBy, isClan }: Readonly<{
	sortBy: SortBy,
	isClan: boolean
}>) {
	return (
		<tr className="ranking-header">
			<th className={styles.rank}>Rank</th>
			<th className={styles.player} colSpan={2}>{!isClan ? "Player" : "Clan"}</th>
			<th className={classNames(styles.acc, { [styles.sorted]: sortBy === SortBy.accuracy })}>Accuracy</th>
			<th className={classNames(styles.playcount, { [styles.sorted]: sortBy === SortBy.playcount })}>Play Count</th>
			<th className={classNames(styles.pp, { [styles.sorted]: sortBy === SortBy.performance })}>Performance</th>
			{sortBy !== "dans" &&
				<>
					<th className={classNames(styles.score, { [styles.sorted]: sortBy === SortBy.score })}>Total Score</th>
					<th className={styles.ss_count}>SS</th>
					<th className={styles.s_count}>S</th>
					<th className={styles.a_count}>A</th>
				</>
			}
		</tr>
	);
}
