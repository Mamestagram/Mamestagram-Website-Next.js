import FontAwesome from "@/components/font-awesome";
import SearchGroupActions from "@/components/header/search-group-actions";
import SearchUserList from "@/components/search/search-user-list";
import type { SearchUser } from "@/lib/search";
import styles from "@s/header-search.module.css";

export default function SearchUserResults({ users, baseDomain, query, total, onSelect }: Readonly<{
	users: SearchUser[],
	baseDomain: string,
	query: string,
	total: number,
	onSelect: () => void
}>) {
	return (
		<section className={styles.result_group} aria-labelledby="player-search-results">
			<h2 id="player-search-results" className={styles.result_group_heading}>
				<span><FontAwesome prefix="fad" name="users"/>Players</span>
				<SearchGroupActions category="players" query={query} total={total} onSelect={onSelect}/>
			</h2>
			<SearchUserList items={users} baseDomain={baseDomain} onSelect={onSelect}/>
		</section>
	);
}
