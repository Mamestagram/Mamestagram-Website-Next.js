import classNames from "classnames";
import Link from "next/link";
import Image from "next/image";
import type { RankingList } from "@/database/leaderboard";
import { SortBy } from "@/database/leaderboard";
import { OsuMode } from "@/lib/mode";
import CountryFlag from "@/components/country-flag";
import ClickableRankingRow from "@/components/leaderboard/clickable-ranking-row";
import styles from "@s/leaderboard.module.css";

export default function RankingRow({ listRow, mode, sortBy, isClan }: Readonly<{
	listRow: RankingList,
	mode: OsuMode,
	sortBy: SortBy,
	isClan: boolean
}>) {
	const queries: string[] = [];
	if (isClan) queries.push("clan");
	if (sortBy === SortBy.dans) queries.push("dans");
	const profileHref = `/profile/${listRow.id}/${mode}${queries.length > 0 ? `?${queries.join("&")}` : ""}`;

	return (
		<ClickableRankingRow className={styles.ranking_row} href={profileHref}>
			<td className={classNames(styles.rank, { [styles[`top_${listRow.rank}`]]: listRow.rank <= 3 })}>#{listRow.rank.toLocaleString()}</td>
			<td className={!isClan ? styles.country : styles.avatar}>
				{!isClan
					? <CountryFlag code={listRow.country}/>
					: <Image src={`https://clan-a.${process.env.BASE_DOMAIN}/${listRow.id}`}
					         alt="clan-avatar"
					         fill
					         draggable={false}
					         sizes="(max-width: 768px) 100vw, 50vw"
					         priority/>
				}
			</td>
			<td className={styles.name}>
				<Link className={styles.row_link} href={profileHref}>
					<span className={styles.name_text}>{listRow.tag}{listRow.name}</span>
				</Link>
			</td>
			<td className={classNames(styles.acc, { [styles.sorted]: sortBy === SortBy.accuracy })}>
				{listRow.acc.toFixed(2)}<span className={styles.percent_label}>%</span>
			</td>
			<td className={classNames(styles.playcount, { [styles.sorted]: sortBy === SortBy.playcount })}>
				{Math.floor(listRow.plays).toLocaleString()}
			</td>
			<td className={classNames(styles.pp, { [styles.sorted]: sortBy === SortBy.performance || sortBy === SortBy.dans })}>
				{Math.round(listRow.pp).toLocaleString()}<span className={styles.pp_label}>pp</span>
			</td>
			{sortBy !== SortBy.dans &&
				<>
					<td className={classNames(styles.score, { [styles.sorted]: sortBy === SortBy.score })}>
						{Math.round(listRow.score).toLocaleString()}
					</td>
					<td className={styles.ss_count}>{Math.floor(listRow.xCount).toLocaleString()}</td>
					<td className={styles.s_count}>{Math.floor(listRow.sCount).toLocaleString()}</td>
					<td className={styles.a_count}>{Math.floor(listRow.aCount).toLocaleString()}</td>
				</>
			}
		</ClickableRankingRow>
	);
}
