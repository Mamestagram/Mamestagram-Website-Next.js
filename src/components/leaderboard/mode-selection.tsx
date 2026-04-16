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
						<li className={classNames(styles.playstyle, "vn", { [styles.selected_playstyle]: mode === OsuMode.std })}>
							<Link href={`/leaderboard/${OsuMode.std}/${sortBy}${queryStr}`}>
								Vanilla
							</Link>
						</li>
						<li className={classNames(styles.playstyle, "rx", { [styles.selected_playstyle]: mode === OsuMode.rxstd })}>
							<Link href={`/leaderboard/${OsuMode.rxstd}/${sortBy}${queryStr}`}>
								Relax
							</Link>
						</li>
						<li className={classNames(styles.playstyle, "ap", { [styles.selected_playstyle]: mode === OsuMode.apstd })}>
							<Link href={`/leaderboard/${OsuMode.apstd}/${sortBy}${queryStr}`}>
								Auto Pilot
							</Link>
						</li>
					</ul>
				</li>
				<li className={classNames(styles.mode, "taiko", { [styles.selected_mode]: modeGroup.taiko.includes(mode) })}>
					<ModeIcon mode={OsuMode.taiko}/>
					<span className={styles.mode_name}>Taiko</span>
					<ul className={styles.playstyle_selection}>
						<li className={classNames(styles.playstyle, "vn", { [styles.selected_playstyle]: mode === OsuMode.taiko })}>
							<Link href={`/leaderboard/${OsuMode.taiko}/${sortBy}${queryStr}`}>
								Vanilla
							</Link>
						</li>
						<li className={classNames(styles.playstyle, "rx", { [styles.selected_playstyle]: mode === OsuMode.rxtaiko })}>
							<Link href={`/leaderboard/${OsuMode.rxtaiko}/${sortBy}${queryStr}`}>
								Relax
							</Link>
						</li>
					</ul>
				</li>
				<li className={classNames(styles.mode, "ctb", { [styles.selected_mode]: modeGroup.ctb.includes(mode) })}>
					<ModeIcon mode={OsuMode.ctb}/>
					<span className={styles.mode_name}>Catch</span>
					<ul className={styles.playstyle_selection}>
						<li className={classNames(styles.playstyle, "vn", { [styles.selected_playstyle]: mode === OsuMode.ctb })}>
							<Link href={`/leaderboard/${OsuMode.ctb}/${sortBy}${queryStr}`}>
								Vanilla
							</Link>
						</li>
						<li className={classNames(styles.playstyle, "rx", { [styles.selected_playstyle]: mode === OsuMode.rxctb })}>
							<Link href={`/leaderboard/${OsuMode.rxctb}/${sortBy}${queryStr}`}>
								Relax
							</Link>
						</li>
					</ul>
				</li>
				<li className={classNames(styles.mode, "mania", { [styles.selected_mode]: modeGroup.mania.includes(mode) })}>
					<ModeIcon mode={OsuMode.mania}/>
					<span className={styles.mode_name}>Mania</span>
					<ul className={styles.playstyle_selection}>
						<li className={classNames(styles.playstyle, "vn", { [styles.selected_playstyle]: mode === OsuMode.mania })}>
							<Link href={`/leaderboard/${OsuMode.mania}/${sortBy}${queryStr}`}>
								Vanilla
							</Link>
						</li>
					</ul>
				</li>
			</ul>
		</aside>
	);
}