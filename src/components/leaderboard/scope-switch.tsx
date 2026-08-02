import classNames from "classnames";
import Link from "next/link";
import type { SortBy } from "@/database/leaderboard";
import type { OsuMode } from "@/lib/mode";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/leaderboard.module.css";

export default function LeaderboardScopeSwitch({ mode, sortBy, country, isClan }: {
	mode: OsuMode,
	sortBy: SortBy,
	country?: string,
	isClan: boolean
}) {
	const basePath = `/leaderboard/${mode}/${sortBy}`;
	const playerHref = `${basePath}${country ? `?country=${encodeURIComponent(country)}` : ""}`;

	return (
		<nav className={styles.leaderboard_scope_switch}
		     data-scope={isClan ? "clans" : "players"}
		     aria-label="Leaderboard type">
			<Link href={playerHref}
			      aria-current={!isClan ? "page" : undefined}
			      className={classNames({ [styles.selected_scope]: !isClan })}>
				<FontAwesome prefix="fas" name="user"/>
				<span>Players</span>
			</Link>
			<Link href={`${basePath}?clan`}
			      aria-current={isClan ? "page" : undefined}
			      className={classNames({ [styles.selected_scope]: isClan })}>
				<FontAwesome prefix="fas" name="people-group"/>
				<span>Clans</span>
			</Link>
		</nav>
	);
}
