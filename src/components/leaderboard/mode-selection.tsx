import classNames from "classnames";
import Link from "next/link";
import type { SortBy } from "@/database/leaderboard";
import { OsuMode } from "@/lib/mode";
import ModeIcon from "@/components/mode-icon";
import styles from "@s/leaderboard.module.css";

export default function ModeSelection({ mode, sortBy, isClan, country }: {
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
	const queryStr = queries.length > 0 ? `?${queries.join("&")}` : "";
	
	return (
		<aside className={styles.selection_wrapper}>
			<ul className={styles.mode_selection}>
				<li className={classNames(styles.mode, "std")}>
					<div className={styles.mode_icon}>
						<ModeIcon mode={OsuMode.std}/>
						{OsuMode.std}
					</div>
					<ul className={styles.playstyle_selection}>
						<Link href={`/leaderboard/${OsuMode.std}/${sortBy}${queryStr}`}>
							Vanilla
						</Link>
						<Link href={`/leaderboard/${OsuMode.rxstd}/${sortBy}${queryStr}`}>
							Relax
						</Link>
						<Link href={`/leaderboard/${OsuMode.apstd}/${sortBy}${queryStr}`}>
							Auto Pilot
						</Link>
					</ul>
				</li>
			</ul>
		</aside>
	);
}