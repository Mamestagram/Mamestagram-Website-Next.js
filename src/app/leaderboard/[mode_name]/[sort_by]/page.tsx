import { notFound } from "next/navigation";
import { SortBy, getCountryList } from "@/database/leaderboard";
import { Mode } from "@/lib/mode";
import { writeLog } from "@/lib/log";
import RankingList from "@/components/leaderboard/ranking-list";
import styles from "@s/leaderboard.module.css";
import { Suspense } from "react";

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
		Object.values(Mode).includes(mode_name as Mode),
		Object.values(SortBy).includes(sort_by as SortBy),
		!isNaN(Number(page)) && Number(page) > 0,
		(country === undefined && clan === undefined) || (country === undefined && clan !== undefined) || (country !== undefined && clan === undefined),
		country === undefined || countries.find((value) => value.country === country) !== undefined,
		clan === undefined || clan === ""
	];
	const queries = `(page: ${page}${country !== undefined ? `, country: ${country}` : ""}, clan: ${clan !== undefined ? "true" : "false"})`
	writeLog("GET", `/leaderboard/${mode_name}/${sort_by}} ${queries}`).then();
	
	if (conds.every((cond) => cond)) {
		const mode = mode_name as Mode, sortBy = sort_by as SortBy, isClan = clan !== undefined;
		
		return (
			<div className={styles.leaderboard_container}>
				<div className={styles.table_wrapper}>
					<Suspense fallback={null/*TODO*/}>
						<RankingList mode={mode} sortBy={sortBy} page={Number(page)} isClan={isClan} country={country} />
					</Suspense>
				</div>
			</div>
		);
	}
	else {
		notFound();
	}
}