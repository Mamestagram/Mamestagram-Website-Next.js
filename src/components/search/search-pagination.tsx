import Link from "next/link";
import FontAwesome from "@/components/font-awesome";
import { getSearchHref, type SearchCategory } from "@/lib/search-route";
import styles from "@s/search.module.css";

export default function SearchPagination({ category, query, currentPage, totalPages }: Readonly<{
	category: SearchCategory,
	query: string,
	currentPage: number,
	totalPages: number
}>) {
	const windowSize = Math.min(7, totalPages);
	const start = Math.min(
		Math.max(currentPage - Math.floor(windowSize / 2), 1),
		Math.max(totalPages - windowSize + 1, 1)
	);
	const pages = Array.from({ length: windowSize }, (_, index) => start + index);
	
	return (
		<nav className={styles.pagination} aria-label="Search result pages">
			{currentPage > 1 &&
				<Link href={getSearchHref(category, query, currentPage - 1)} aria-label="Previous page">
					<FontAwesome prefix="fas" name="chevron-left"/>
				</Link>}
			{pages.map((page) =>
				<Link key={page}
				      href={getSearchHref(category, query, page)}
				      aria-current={page === currentPage ? "page" : undefined}>
					{page}
				</Link>)}
			{currentPage < totalPages &&
				<Link href={getSearchHref(category, query, currentPage + 1)} aria-label="Next page">
					<FontAwesome prefix="fas" name="chevron-right"/>
				</Link>}
		</nav>
	);
}
