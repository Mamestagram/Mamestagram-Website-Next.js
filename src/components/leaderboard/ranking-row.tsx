import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { RankingList, SortBy } from "@/database/leaderboard";
import { Mode } from "@/lib/mode";
import CountryFlag from "@/components/country-flag";
import styles from "@s/leaderboard.module.css";

export default function RankingRow({ listRow, mode, sortBy, isClan }: Readonly<{
	listRow: RankingList,
	mode: Mode,
	sortBy: SortBy,
	isClan: boolean
}>) {
	return (
		<tr className={styles.ranking_row}>
			<td className={classNames(styles.rank, { [styles[`top_${listRow.rank}`]]: listRow.rank <= 3 })}>#{listRow.rank.toLocaleString()}</td>
			{!isClan
				? <td className={styles.country}><CountryFlag code={listRow.country}/></td>
				: <td className={styles.avatar}><Image src={`https://clan-a.${process.env.BASE_DOMAIN}/${listRow.id}`} alt="" fill sizes="(max-width: 768px) 100vw, 50vw"/></td>
			}
			<td className={styles.name}>
				{!isClan
					? <Link href={`/profile/${listRow.id}/${mode}${sortBy === SortBy.dans ? "?dans" : ""}`}>{listRow.tag !== null && `[${listRow.tag}] `}{listRow.name}</Link>
					: <Link href={`/profile/${listRow.id}/${mode}?clan${sortBy === SortBy.dans ? "&dans" : ""}`}>{listRow.tag}</Link>}
			</td>
			<td className={classNames(styles.acc, { [styles.sorted]: sortBy === SortBy.accuracy })}>
				{listRow.acc.toFixed(2)}<span className="percent-label">%</span>
			</td>
			<td className={classNames(styles.playcount, { [styles.sorted]: sortBy === SortBy.playcount })}>
				{Math.floor(listRow.plays).toLocaleString()}
			</td>
			<td className={classNames(styles.pp, { [styles.sorted]: sortBy === SortBy.performance })}>
				{Math.round(listRow.pp).toLocaleString()}<span className="pp-label">pp</span>
			</td>
			{sortBy !== SortBy.dans &&
				<>
					<td className={classNames(styles.score, { [styles.sorted]: sortBy === SortBy.score })}>
						{Math.round(listRow.score).toLocaleString()}
					</td>
					<td className={styles.ss_count}>{Math.floor(listRow.ssCount).toLocaleString()}</td>
					<td className={styles.s_count}>{Math.floor(listRow.sCount).toLocaleString()}</td>
					<td className={styles.a_count}>{Math.floor(listRow.aCount).toLocaleString()}</td>
				</>
			}
		</tr>
	);
}