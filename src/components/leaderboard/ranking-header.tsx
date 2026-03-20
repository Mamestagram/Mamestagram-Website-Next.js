import { SortBy } from "@/database/leaderboard";
import styles from "@s/leaderboard.module.css";

export default function RankingHeader({ sortBy }: Readonly<{ sortBy: SortBy }>) {
	return (
		<tr>
			<th className={styles.rank}>Rank</th>
			<th className={styles.player} colSpan={2}>Player</th>
			<th>Accuracy</th>
			<th>Play Count</th>
			<th>Performance</th>
			{sortBy !== "dans" &&
				<>
					<th>Total Score</th>
					<th>SS</th>
					<th>S</th>
					<th>A</th>
				</>
			}
		</tr>
	);
}