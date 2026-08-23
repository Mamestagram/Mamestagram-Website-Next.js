"use client";

import { useHeaderSearch } from "@/components/context/header-search-provider";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/header-search.module.css";

export default function HeaderSearchTrigger({ location }: { location: "top" | "navigation" }) {
	const { openSearch } = useHeaderSearch();
	const button = (
		<button className={location === "navigation" ? styles.navigation_trigger : "search"}
		        type="button"
		        title="Search"
		        aria-label="Open search"
		        aria-haspopup="dialog"
		        onClick={(event) => openSearch(event.currentTarget)}>
			<FontAwesome prefix="fas" name="magnifying-glass"/>
		</button>
	);

	return location === "navigation" ? <li className="search">{button}</li> : button;
}
