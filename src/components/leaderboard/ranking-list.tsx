import { notFound } from "next/navigation";
import { SortBy, getLeaderboard } from "@/database/leaderboard";
import { OsuMode, ModeNum } from "@/lib/mode";
import { Priv } from "@/lib/priv";
import { getCurrentUser } from "@/lib/session";
import PageList from "./page-list";
import ClickableRankingTable from "./clickable-ranking-table";
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
	const [{ ranking, pages }, currentUser] = await Promise.all([
		getLeaderboard(ModeNum[mode], sortBy, Number(page), isClan, country),
		isClan ? Promise.resolve(null) : getCurrentUser()
	]);
	const canViewPrivateUsers = currentUser?.isLoggedIn === true
		&& currentUser.priv !== undefined
		&& (currentUser.priv & Priv.staff) !== 0;
	
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
						<ClickableRankingTable>
							<thead>
							<RankingHeader sortBy={sortBy} isClan={isClan}/>
							</thead>
							<tbody>
							{ranking.map((row) =>
								<RankingRow key={row.id}
								            listRow={row}
								            mode={mode}
								            sortBy={sortBy}
								            isClan={isClan}
								            hidePrivateDetails={row.isPrivate === 1
									            && currentUser?.id !== row.id
									            && !canViewPrivateUsers}/>)}
							</tbody>
						</ClickableRankingTable>
					}
				</div>
			</>
		);
	}
	else {
		notFound();
	}
}
