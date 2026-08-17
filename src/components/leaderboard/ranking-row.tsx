import classNames from "classnames";
import Link from "next/link";
import Image from "next/image";
import type { RankingList } from "@/database/leaderboard";
import { SortBy } from "@/database/leaderboard";
import { OsuMode } from "@/lib/mode";
import CountryFlag from "@/components/country-flag";
import ClickableRankingRow from "@/components/leaderboard/clickable-ranking-row";
import styles from "@s/leaderboard.module.css";

const topRankStyles = [styles.top_1, styles.top_2, styles.top_3] as const;

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
			<td className={classNames(styles.rank, topRankStyles[listRow.rank - 1])}>
				<span className={styles.numeric_value}>#{listRow.rank.toLocaleString()}</span>
			</td>
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
				<span className={styles.numeric_value}>{listRow.acc.toFixed(2)}</span><span className={styles.percent_label}>%</span>
			</td>
			<td className={classNames(styles.playcount, { [styles.sorted]: sortBy === SortBy.playcount })}>
				<span className={styles.numeric_value}>{Math.floor(listRow.plays).toLocaleString()}</span>
			</td>
			<td className={classNames(styles.pp, { [styles.sorted]: sortBy === SortBy.performance || sortBy === SortBy.dans })}>
				<span className={styles.numeric_value}>{Math.round(listRow.pp).toLocaleString()}</span><span className={styles.pp_label}>pp</span>
			</td>
			{sortBy !== SortBy.dans &&
				<>
					<td className={classNames(styles.score, { [styles.sorted]: sortBy === SortBy.score })}>
						<span className={styles.numeric_value}>{Math.round(listRow.score).toLocaleString()}</span>
					</td>
					<td className={styles.ss_count}><span className={styles.numeric_value}>{Math.floor(listRow.xCount).toLocaleString()}</span></td>
					<td className={styles.s_count}><span className={styles.numeric_value}>{Math.floor(listRow.sCount).toLocaleString()}</span></td>
					<td className={styles.a_count}><span className={styles.numeric_value}>{Math.floor(listRow.aCount).toLocaleString()}</span></td>
				</>
			}
		</ClickableRankingRow>
	);
}
