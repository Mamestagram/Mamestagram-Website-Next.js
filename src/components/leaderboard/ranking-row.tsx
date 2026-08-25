import classNames from "classnames";
import Link from "next/link";
import Image from "next/image";
import type { RankingList } from "@/database/leaderboard";
import { SortBy } from "@/database/leaderboard";
import { OsuMode } from "@/lib/mode";
import CountryFlag from "@/components/country-flag";
import FormattedNumber from "@/components/formatted-number";
import { appendAvatarQueryMarker } from "@/lib/avatar-url";
import styles from "@s/leaderboard.module.css";

const topRankStyles = [styles.top_1, styles.top_2, styles.top_3] as const;

export default function RankingRow({
	listRow,
	mode,
	sortBy,
	isClan,
	hidePrivateDetails,
}: Readonly<{
	listRow: RankingList;
	mode: OsuMode;
	sortBy: SortBy;
	isClan: boolean;
	hidePrivateDetails: boolean;
}>) {
	const queries: string[] = [];
	if (isClan) queries.push("clan");
	if (sortBy === SortBy.dans) queries.push("dans");
	const profileHref = `/profile/${listRow.id}/${mode}${queries.length > 0 ? `?${queries.join("&")}` : ""}`;
	
	return (
		<tr
			className={styles.ranking_row}
			data-href={profileHref}
			data-private={hidePrivateDetails}
			data-rendering-item="compact"
		>
			<td className={classNames(styles.rank, topRankStyles[listRow.rank - 1])}>
        <span>
          #<FormattedNumber value={listRow.rank}/>
        </span>
			</td>
			{hidePrivateDetails ? (
				<td
					className={styles.private_user_cell}
					colSpan={sortBy === SortBy.dans ? 5 : 9}
				>
					<strong className={styles.private_user_name}>Private User</strong>
				</td>
			) : (
				<>
					<td className={!isClan ? styles.country : styles.avatar}>
						{!isClan ? (
							<CountryFlag code={listRow.country}/>
						) : (
							<Image
								src={appendAvatarQueryMarker(
									`https://clan-a.${process.env.BASE_DOMAIN}/${listRow.id}`,
								)}
								alt="clan-avatar"
								fill
								draggable={false}
								sizes="(max-width: 768px) 100vw, 50vw"
							/>
						)}
					</td>
					<td className={styles.name}>
						<Link className={styles.row_link} href={profileHref}>
              <span className={styles.name_text}>
                {listRow.tag !== null && `[${listRow.tag}] `}
	              {listRow.name}
              </span>
						</Link>
					</td>
					<td
						className={classNames(styles.acc, {
							[styles.sorted]: sortBy === SortBy.accuracy,
						})}
					>
						<span>{listRow.acc.toFixed(2)}</span>
						<span className={styles.percent_label}>%</span>
					</td>
					<td
						className={classNames(styles.playcount, {
							[styles.sorted]: sortBy === SortBy.playcount,
						})}
					>
            <span>
              <FormattedNumber value={Math.floor(listRow.plays)}/>
            </span>
					</td>
					<td
						className={classNames(styles.pp, {
							[styles.sorted]:
								sortBy === SortBy.performance || sortBy === SortBy.dans,
						})}
					>
            <span>
              <FormattedNumber value={Math.round(listRow.pp)}/>
            </span>
						<span className={styles.pp_label}>pp</span>
					</td>
					{sortBy !== SortBy.dans && (
						<>
							<td
								className={classNames(styles.score, {
									[styles.sorted]: sortBy === SortBy.score,
								})}
							>
                <span>
                  <FormattedNumber value={Math.round(listRow.score)}/>
                </span>
							</td>
							<td className={styles.ss_count}>
                <span>
                  <FormattedNumber value={Math.floor(listRow.xCount)}/>
                </span>
							</td>
							<td className={styles.s_count}>
                <span>
                  <FormattedNumber value={Math.floor(listRow.sCount)}/>
                </span>
							</td>
							<td className={styles.a_count}>
                <span>
                  <FormattedNumber value={Math.floor(listRow.aCount)}/>
                </span>
							</td>
						</>
					)}
				</>
			)}
		</tr>
	);
}
