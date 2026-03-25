import type { RankingList } from "@/database/leaderboard";
import { SortBy } from "@/database/leaderboard";
import { OsuMode } from "@/lib/mode";
import RankingHeader from "@/components/leaderboard/ranking-header";
import RankingRow from "@/components/leaderboard/ranking-row";
import styles from "@s/leaderboard.module.css";

export default async function RankingList({ ranking, mode, sortBy, isClan }: Readonly<{
	ranking: RankingList[],
	mode: OsuMode,
	sortBy: SortBy,
	isClan: boolean,
}>) {
	return (
		<div className={styles.table_wrapper}>
			{ranking.length > 0 &&
				<table>
					<thead>
					<RankingHeader sortBy={sortBy} isClan={isClan}/>
					</thead>
					<tbody>
					{ranking.map((row) =>
						<RankingRow key={row.id} listRow={row} mode={mode} sortBy={sortBy} isClan={isClan}/>)}
					</tbody>
				</table>
			}
		</div>
	);
}