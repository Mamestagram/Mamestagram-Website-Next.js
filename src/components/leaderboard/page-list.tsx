import Link from "next/link";
import { OsuMode } from "@/lib/mode";
import { SortBy } from "@/database/leaderboard";
import styles from "@s/leaderboard.module.css";

export default function PageList({ page, mode, sortBy, isClan, country }: {
	page: {
		current: number,
		total: number
	},
	mode: OsuMode,
	sortBy: SortBy,
	isClan: boolean,
	country: string | undefined
}) {
	const queries: string[] = [];
	const conds: [string, boolean][] = [
		["clan", isClan],
		[`country=${country}`, country !== undefined]
	];
	conds.forEach(([query, cond]) => { if (cond) queries.push(query); });
	const queryStr = queries.length > 0 ? `&${queries.join("&")}` : "";
	
	return (
		<div className="page-wrapper">
			{page.current > 1 &&
				<Link href={`/leaderboard/${mode}/${sortBy}?page=${page.current - 1}${queryStr}`}>
				
				</Link>
			}
			<ul className={styles.page_list}>
				{Array.from({ length: page.total }).map((_val, i) =>
					<li key={i}>
						<Link href={`/leaderboard/${mode}/${sortBy}?page=${i + 1}${queryStr}`}>{i + 1}</Link>
					</li>
				)}
			</ul>
		</div>
	);
}