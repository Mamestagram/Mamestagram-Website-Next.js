import { getLeaderboard } from "@/database/leaderboard";
import { SortBy } from "@/database/leaderboard";
import { Mode, ModeNum } from "@/lib/mode";
import RankingHeader from "@/components/leaderboard/ranking-header";
import RankingRow from "@/components/leaderboard/ranking-row";

export default async function RankingList({ mode, sortBy, page, isClan, country }: Readonly<{
	mode: Mode,
	sortBy: SortBy,
	page: number,
	isClan: boolean,
	country: string | undefined
}>) {
	const { ranking, pages } = await getLeaderboard(ModeNum[mode], sortBy, page, isClan, country);
	
	return (
		<>
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
		</>
	);
}