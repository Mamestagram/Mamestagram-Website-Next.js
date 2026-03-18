import Image from "next/image";
import Link from "next/link";
import type { RankingList } from "@/database/leaderboard";
import { SortBy } from "@/database/leaderboard";
import { Mode } from "@/lib/mode";
import CountryFlag from "@/components/country-flag";
import styles from "@s/leaderboard.module.css";

export default function RankingList({ list, mode, sortBy, isClan }: {
	list: RankingList,
	mode: Mode,
	sortBy: SortBy,
	isClan: boolean
}) {
	return (
		<tr>
			<td className="rank">#{list.rank}</td>
			{!isClan
				? <td className={styles.country_flag}><CountryFlag code={list.country}/></td>
				: <td className="avatar"><Image src={`https://clan-a.${process.env.BASE_DOMAIN}/${list.id}`} alt="" fill sizes="(max-width: 768px) 100vw, 50vw"/></td>
			}
			<td className="name">
				{!isClan
					? <Link href={`/profile/${list.id}/${mode}${sortBy === SortBy.dans ? "?dans" : ""}`}>{list.tag !== null && `[${list.tag}] `}{list.name}</Link>
					: <Link href={`/profile/${list.id}/${mode}?clan${sortBy === SortBy.dans ? "&dans" : ""}`}>{list.tag}</Link>}
			</td>
			<td className="acc">{list.acc.toFixed(2)}%</td>
			<td className="playcount">{Math.floor(list.plays).toLocaleString()}</td>
			<td className="pp">{Math.round(list.pp).toLocaleString()}</td>
			{sortBy !== SortBy.dans &&
				<>
					<td className="socre">{Math.round(list.score).toLocaleString()}</td>
					<td className="ss-count">{Math.floor(list.ssCount).toLocaleString()}</td>
					<td className="s-count">{Math.floor(list.sCount).toLocaleString()}</td>
					<td className="a-count">{Math.floor(list.aCount).toLocaleString()}</td>
				</>
			}
		</tr>
	);
}