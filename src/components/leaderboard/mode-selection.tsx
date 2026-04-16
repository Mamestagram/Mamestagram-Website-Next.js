import classNames from "classnames";
import Link from "next/link";
import { SortBy } from "@/database/leaderboard";
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
	const refSortBy = sortBy !== SortBy.dans ? sortBy : SortBy.performance;
	const modeGroup = {
		std: [OsuMode.std, OsuMode.rxstd, OsuMode.apstd],
		taiko: [OsuMode.taiko, OsuMode.rxtaiko],
		ctb: [OsuMode.ctb, OsuMode.rxctb],
		mania: [OsuMode.mania]
	};
	
	return (
		<aside className={styles.selection_wrapper}>
			<ul className={styles.mode_selection}>
				<li className={classNames(styles.mode, "std", { [styles.selected_mode]: modeGroup.std.includes(mode) })}>
					<ModeIcon mode={OsuMode.std}/>
					<span className={styles.mode_name}>STD</span>
					<ul className={styles.playstyle_selection}>
						<li className={classNames(styles.playstyle, "vn", { [styles.selected_playstyle]: mode === OsuMode.std && sortBy !== SortBy.dans })}>
							<Link href={`/leaderboard/${OsuMode.std}/${refSortBy}${queryStr}`}>
								Vanilla
							</Link>
						</li>
						<li className={classNames(styles.playstyle, "rx", { [styles.selected_playstyle]: mode === OsuMode.rxstd && sortBy !== SortBy.dans })}>
							<Link href={`/leaderboard/${OsuMode.rxstd}/${refSortBy}${queryStr}`}>
								Relax
							</Link>
						</li>
						<li className={classNames(styles.playstyle, "ap", { [styles.selected_playstyle]: mode === OsuMode.apstd && sortBy !== SortBy.dans })}>
							<Link href={`/leaderboard/${OsuMode.apstd}/${refSortBy}${queryStr}`}>
								AutoPilot
							</Link>
						</li>
						<li className={classNames(styles.playstyle, "dan", { [styles.selected_playstyle]: mode === OsuMode.std && sortBy === SortBy.dans })}>
							<Link href={`/leaderboard/${OsuMode.std}/dans${queryStr}`}>
								Dans
							</Link>
						</li>
					</ul>
				</li>
				<li className={classNames(styles.mode, "taiko", { [styles.selected_mode]: modeGroup.taiko.includes(mode) })}>
					<ModeIcon mode={OsuMode.taiko}/>
					<span className={styles.mode_name}>Taiko</span>
					<ul className={styles.playstyle_selection}>
						<li className={classNames(styles.playstyle, "vn", { [styles.selected_playstyle]: mode === OsuMode.taiko && sortBy !== SortBy.dans })}>
							<Link href={`/leaderboard/${OsuMode.taiko}/${refSortBy}${queryStr}`}>
								Vanilla
							</Link>
						</li>
						<li className={classNames(styles.playstyle, "rx", { [styles.selected_playstyle]: mode === OsuMode.rxtaiko && sortBy !== SortBy.dans })}>
							<Link href={`/leaderboard/${OsuMode.rxtaiko}/${refSortBy}${queryStr}`}>
								Relax
							</Link>
						</li>
						<li className={classNames(styles.playstyle, "dan", { [styles.selected_playstyle]: mode === OsuMode.taiko && sortBy === SortBy.dans })}>
							<Link href={`/leaderboard/${OsuMode.taiko}/dans${queryStr}`}>
								Dans
							</Link>
						</li>
					</ul>
				</li>
				<li className={classNames(styles.mode, "ctb", { [styles.selected_mode]: modeGroup.ctb.includes(mode) })}>
					<ModeIcon mode={OsuMode.ctb}/>
					<span className={styles.mode_name}>Catch</span>
					<ul className={styles.playstyle_selection}>
						<li className={classNames(styles.playstyle, "vn", { [styles.selected_playstyle]: mode === OsuMode.ctb && sortBy !== SortBy.dans })}>
							<Link href={`/leaderboard/${OsuMode.ctb}/${refSortBy}${queryStr}`}>
								Vanilla
							</Link>
						</li>
						<li className={classNames(styles.playstyle, "rx", { [styles.selected_playstyle]: mode === OsuMode.rxctb && sortBy !== SortBy.dans })}>
							<Link href={`/leaderboard/${OsuMode.rxctb}/${refSortBy}${queryStr}`}>
								Relax
							</Link>
						</li>
						<li className={classNames(styles.playstyle, "dan", { [styles.selected_playstyle]: mode === OsuMode.ctb && sortBy === SortBy.dans })}>
							<Link href={`/leaderboard/${OsuMode.ctb}/dans${queryStr}`}>
								Dans
							</Link>
						</li>
					</ul>
				</li>
				<li className={classNames(styles.mode, "mania", { [styles.selected_mode]: modeGroup.mania.includes(mode) })}>
					<ModeIcon mode={OsuMode.mania}/>
					<span className={styles.mode_name}>Mania</span>
					<ul className={styles.playstyle_selection}>
						<li className={classNames(styles.playstyle, "vn", { [styles.selected_playstyle]: mode === OsuMode.mania && sortBy !== SortBy.dans })}>
							<Link href={`/leaderboard/${OsuMode.mania}/${refSortBy}${queryStr}`}>
								Vanilla
							</Link>
						</li>
						<li className={classNames(styles.playstyle, "dan", { [styles.selected_playstyle]: mode === OsuMode.mania && sortBy === SortBy.dans })}>
							<Link href={`/leaderboard/${OsuMode.mania}/dans${queryStr}`}>
								Dans
							</Link>
						</li>
					</ul>
				</li>
			</ul>
		</aside>
	);
}