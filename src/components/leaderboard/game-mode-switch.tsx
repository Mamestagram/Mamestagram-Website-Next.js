import classNames from "classnames";
import Link from "next/link";
import type { SortBy } from "@/database/leaderboard";
import type { OsuMode } from "@/lib/mode";
import ModeIcon from "@/components/mode-icon";
import {
	getLeaderboardBaseMode,
	getLeaderboardModeGroup,
	getLeaderboardPlaystyle,
	LEADERBOARD_DANS_SORT,
	LEADERBOARD_PERFORMANCE_SORT,
	leaderboardModeGroups,
} from "@/components/leaderboard/leaderboard-mode-options";
import styles from "@s/leaderboard.module.css";

export default function GameModeSwitch({
	mode,
	sortBy,
	country,
	isClan,
}: Readonly<{
	mode: OsuMode;
	sortBy: SortBy;
	country?: string;
	isClan: boolean;
}>) {
	const currentBaseMode = getLeaderboardBaseMode(mode);
	const currentPlaystyle = getLeaderboardPlaystyle(mode, sortBy);
	const referenceSort =
		sortBy === LEADERBOARD_DANS_SORT ? LEADERBOARD_PERFORMANCE_SORT : sortBy;
	const query = [
		isClan ? "clan" : "",
		country !== undefined ? `country=${encodeURIComponent(country)}` : "",
	].filter(Boolean);
	const queryString = query.length > 0 ? `?${query.join("&")}` : "";
	
	const getHref = (
		baseMode: (typeof leaderboardModeGroups)[number]["mode"],
	) => {
		const group = getLeaderboardModeGroup(baseMode);
		const option =
			group.options.find(({ label }) => label === currentPlaystyle) ??
			group.options[0];
		const destinationSort = option.dans ? LEADERBOARD_DANS_SORT : referenceSort;
		return `/leaderboard/${option.mode}/${destinationSort}${queryString}`;
	};
	
	return (
		<nav className={styles.game_mode_switch} aria-label="Game mode">
			{leaderboardModeGroups.map((group) => (
				<Link
					key={group.mode}
					href={getHref(group.mode)}
					aria-label={group.label}
					title={group.label}
					aria-current={group.mode === currentBaseMode ? "page" : undefined}
					className={classNames({
						[styles.selected_game_mode]: group.mode === currentBaseMode,
					})}
				>
					<ModeIcon mode={group.mode}/>
				</Link>
			))}
		</nav>
	);
}
