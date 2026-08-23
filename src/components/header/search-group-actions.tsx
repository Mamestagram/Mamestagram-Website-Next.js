import Link from "next/link";
import FontAwesome from "@/components/font-awesome";
import FormattedNumber from "@/components/formatted-number";
import type { SearchCategory } from "@/lib/search-route";
import styles from "@s/header-search.module.css";

export default function SearchGroupActions({ category, query, total, onSelect }: Readonly<{
	category: SearchCategory,
	query: string,
	total: number,
	onSelect: () => void
}>) {
	return (
		<span className={styles.result_group_actions}>
			<small><FormattedNumber value={total}/></small>
			<Link href={`/search/${category}?q=${encodeURIComponent(query)}`} onClick={onSelect}>
				Show more <FontAwesome prefix="fas" name="arrow-right"/>
			</Link>
		</span>
	);
}
