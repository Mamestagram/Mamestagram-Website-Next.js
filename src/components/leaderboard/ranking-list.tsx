import type { RankingList } from "@/database/leaderboard";
import { SortBy } from "@/database/leaderboard";
import { Mode } from "@/lib/mode";
import RankingHeader from "@/components/leaderboard/ranking-header";
import RankingRow from "@/components/leaderboard/ranking-row";

export default function RankingList({ ranking, mode, sortBy, isClan }: Readonly<{
	ranking: RankingList[],
	mode: Mode,
	sortBy: SortBy,
	isClan: boolean
}>) {
	return (
		<>
			{ranking.length > 0 &&
				<table>
					<thead>
					<RankingHeader sortBy={sortBy}/>
					</thead>
					<tbody>
					{ranking.map((list) =>
						<RankingRow key={list.id} listRow={list} mode={mode} sortBy={sortBy} isClan={isClan}/>)}
					</tbody>
				</table>
			}
		</>
	);
}