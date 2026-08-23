import FontAwesome from "@/components/font-awesome";
import SearchGroupActions from "@/components/header/search-group-actions";
import SearchClanList from "@/components/search/search-clan-list";
import type { SearchClan } from "@/lib/search";
import styles from "@s/header-search.module.css";

export default function SearchClanResults({ clans, baseDomain, query, total, onSelect }: Readonly<{
	clans: SearchClan[],
	baseDomain: string,
	query: string,
	total: number,
	onSelect: () => void
}>) {
	return (
		<section className={styles.result_group} aria-labelledby="clan-search-results">
			<h2 id="clan-search-results" className={styles.result_group_heading}>
				<span><FontAwesome prefix="fad" name="people-group"/>Clans</span>
				<SearchGroupActions category="clans" query={query} total={total} onSelect={onSelect}/>
			</h2>
			<SearchClanList items={clans} baseDomain={baseDomain} onSelect={onSelect}/>
		</section>
	);
}
