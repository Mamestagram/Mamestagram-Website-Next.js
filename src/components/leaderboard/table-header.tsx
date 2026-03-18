import { SortBy } from "@/database/leaderboard";
import styles from "@s/leaderboard.module.css";

export default function TableHeader({ sortBy }: { sortBy: SortBy }) {
	return (
		<tr>
			<th>Rank</th>
			<th colSpan={2}>Player</th>
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