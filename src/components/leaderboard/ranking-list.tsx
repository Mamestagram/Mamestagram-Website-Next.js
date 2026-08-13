import { notFound } from "next/navigation";
import { SortBy, getLeaderboard } from "@/database/leaderboard";
import { OsuMode, ModeNum } from "@/lib/mode";
import PageList from "./page-list";
import RankingHeader from "./ranking-header";
import RankingRow from "./ranking-row";
import styles from "@s/leaderboard.module.css";

export default async function RankingList({ mode, sortBy, page, country, isClan }: {
	mode: OsuMode,
	sortBy: SortBy,
	page: number,
	country: string | undefined,
	isClan: boolean
}) {
	const { ranking, pages } = await getLeaderboard(ModeNum[mode], sortBy, Number(page), isClan, country);

	if (page <= pages) {
		return (
			<>
				<PageList key={`${mode}:${sortBy}:${page}:${country ?? "all"}:${isClan}`}
				          currentPage={Number(page)}
				          totalPage={pages}
				          mode={mode}
				          sortBy={sortBy}
				          isClan={isClan}
				          country={country}/>
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
			</>
		);
	}
	else {
		notFound();
	}
}
