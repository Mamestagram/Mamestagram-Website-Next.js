import { notFound } from "next/navigation";
import { SortBy, getCountryList, getLeaderboard } from "@/database/leaderboard";
import { OsuMode, ModeNum } from "@/lib/mode";
import { writeLog } from "@/lib/log";
import RankingList from "@/components/leaderboard/ranking-list";
import styles from "@s/leaderboard.module.css";
import ModeSelection from "@/components/leaderboard/mode-selection";
import PageList from "@/components/leaderboard/page-list";

export default async function Leaderboard({ params, searchParams }: {
	params: Promise<{
		mode_name: string,
		sort_by: string
	}>,
	searchParams: Promise<{
		page?: string,
		country?: string,
		clan?: string
	}>
}) {
	const { mode_name, sort_by } = await params;
	const { page = "1", country, clan } = await searchParams;
	const countries = await getCountryList();
	const conds = [
		Object.values(OsuMode).includes(mode_name as OsuMode),
		Object.values(SortBy).includes(sort_by as SortBy),
		!isNaN(Number(page)) && Number(page) > 0,
		(country === undefined && clan === undefined) || (country === undefined && clan !== undefined) || (country !== undefined && clan === undefined),
		country === undefined || countries.find((value) => value.country === country) !== undefined,
		clan === undefined || clan === ""
	];
	const queries = `(page: ${page}, country: ${country}, clan: ${clan})`;
	writeLog("GET", `/leaderboard/${mode_name}/${sort_by} ${queries}`).then();
	
	if (conds.every((cond) => cond)) {
		const mode = mode_name as OsuMode, sortBy = sort_by as SortBy, isClan = clan !== undefined;
		const { ranking, pages } = await getLeaderboard(ModeNum[mode], sortBy, Number(page), isClan, country);
		
		if (Number(page) <= pages) {
			return (
				<div className={styles.container}>
					<ModeSelection mode={mode} sortBy={sortBy} isClan={isClan} country={country}/>
					<PageList currentPage={Number(page)} totalPage={pages} mode={mode} sortBy={sortBy} isClan={isClan} country={country}/>
					<RankingList ranking={ranking} mode={mode} sortBy={sortBy} isClan={isClan}/>
				</div>
			);
		}
		else {
			notFound();
		}
	}
	else {
		notFound();
	}
}