import classNames from "classnames";
import Link from "next/link";
import { SortBy } from "@/database/leaderboard";
import type { OsuMode } from "@/lib/mode";
import styles from "@s/leaderboard.module.css";

const sortOptions = [
	{ value: SortBy.accuracy, label: "Accuracy" },
	{ value: SortBy.playcount, label: "Play Count" },
	{ value: SortBy.performance, label: "PP" },
	{ value: SortBy.score, label: "Score" }
] as const;

export default function RankingSortSwitch({ mode, sortBy, country, isClan }: Readonly<{
	mode: OsuMode,
	sortBy: SortBy,
	country?: string,
	isClan: boolean
}>) {
	const query = [
		isClan ? "clan" : "",
		country !== undefined ? `country=${encodeURIComponent(country)}` : ""
	].filter(Boolean);
	const queryString = query.length > 0 ? `?${query.join("&")}` : "";

	return (
		<nav className={styles.ranking_sort_switch} aria-label="Ranking category">
			<div>
				{sortOptions.map((option) => {
					const isSelected = sortBy === option.value ||
						(sortBy === SortBy.dans && option.value === SortBy.performance);
					const destinationSort = sortBy === SortBy.dans && option.value === SortBy.performance
						? SortBy.dans
						: option.value;
					return (
						<Link key={option.value}
						      href={`/leaderboard/${mode}/${destinationSort}${queryString}`}
						      aria-current={isSelected ? "page" : undefined}
						      className={classNames({ [styles.selected_sort]: isSelected })}>
							{option.label}
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
