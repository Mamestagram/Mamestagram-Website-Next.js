import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SortBy, getCountryList } from "@/database/leaderboard";
import { OsuMode } from "@/lib/mode";
import { writeLog } from "@/lib/log";
import ModeSelection from "@/components/leaderboard/mode-selection";
import RankingList from "@/components/leaderboard/ranking-list";
import RankingListLoading from "@/components/leaderboard/ranking-list-loading";
import LeaderboardHero from "@/components/leaderboard/leaderboard-hero";
import LeaderboardScopeSwitch from "@/components/leaderboard/scope-switch";
import styles from "@s/leaderboard.module.css";

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
	void writeLog("GET", `/leaderboard/${mode_name}/${sort_by} ${queries}`); // log

	if (conds.every((cond) => cond)) {
		const mode = mode_name as OsuMode, sortBy = sort_by as SortBy, isClan = clan !== undefined;

		return (
			<>
				<LeaderboardHero/>
				<div className={styles.container}>
					<LeaderboardScopeSwitch mode={mode}
					                        sortBy={sortBy}
					                        country={country}
					                        isClan={isClan}/>
					<ModeSelection mode={mode} sortBy={sortBy} country={country} isClan={isClan}/>
					<Suspense fallback={<RankingListLoading/>}>
						<RankingList mode={mode} sortBy={sortBy} page={Number(page)} country={country} isClan={isClan}/>
					</Suspense>
				</div>
			</>
		);
	}
	else {
		notFound();
	}
}
