import Link from "next/link";
import { OsuMode } from "@/lib/mode";
import { SortBy } from "@/database/leaderboard";
import FontAwesome from "@/components/font-awesome";
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
			<ul className={styles.page_list}>
				{page.current > 1 &&
					<li>
						<Link href={`/leaderboard/${mode}/${sortBy}?page=${page.current - 1}${queryStr}`}>
							<FontAwesome prefix="fas" name="chevron-left"/>
						</Link>
					</li>
				}
				{Array.from({ length: page.total }).map((_val, i) =>
					<li key={i}>
						<Link href={`/leaderboard/${mode}/${sortBy}?page=${i + 1}${queryStr}`}>{i + 1}</Link>
					</li>
				)}
				{page.current < page.total &&
					<li>
						<Link href={`/leaderboard/${mode}/${sortBy}?page=${page.current + 1}${queryStr}`}>
							<FontAwesome prefix="fas" name="chevron-right"/>
						</Link>
					</li>
				}
			</ul>
		</div>
	);
}