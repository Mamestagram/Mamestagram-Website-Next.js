import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import FontAwesome from "@/components/font-awesome";
import { SearchBeatmapList, SearchClanList, SearchUserList } from "@/components/search/result-lists";
import { searchBeatmapsPage, searchClansPage, searchUsersPage } from "@/database/search";
import styles from "@s/search.module.css";

type SearchCategory = "players" | "clans" | "beatmaps";

const PAGE_SIZE = 48;
const categoryMeta: Record<SearchCategory, { label: string, icon: string, description: string }> = {
	players: {
		label: "Players",
		icon: "users",
		description: "Browse every player matching a name or player ID."
	},
	clans: {
		label: "Clans",
		icon: "people-group",
		description: "Browse every clan matching a clan name, tag, or clan ID."
	},
	beatmaps: {
		label: "Beatmaps",
		icon: "compact-disc",
		description: "Browse every beatmap matching a title, artist, creator, difficulty, map ID, or set ID."
	}
};

const isSearchCategory = (value: string): value is SearchCategory => value in categoryMeta;
const getSearchHref = (category: SearchCategory, query: string, page?: number) => {
	const params = new URLSearchParams();
	if (query) params.set("q", query);
	if (page && page > 1) params.set("page", page.toString());
	const queryString = params.toString();
	return `/search/${category}${queryString ? `?${queryString}` : ""}`;
};

export async function generateMetadata({ params }: {
	params: Promise<{ category: string }>
}): Promise<Metadata> {
	const { category } = await params;
	return { title: isSearchCategory(category) ? `Search ${categoryMeta[category].label}` : "Search" };
}

export default async function SearchResultsPage({ params, searchParams }: {
	params: Promise<{ category: string }>,
	searchParams: Promise<{ q?: string, page?: string }>
}) {
	const { category } = await params;
	const { q = "", page: pageParam = "1" } = await searchParams;
	if (!isSearchCategory(category)) notFound();

	const query = q.trim();
	const page = Number(pageParam);
	if (query.length > 64 || !Number.isSafeInteger(page) || page < 1) notFound();

	const baseDomain = process.env.BASE_DOMAIN;
	if (!baseDomain) throw new Error("BASE_DOMAIN is not configured");

	let resultList: ReactNode = null;
	let total = 0;
	let totalPages = 1;
	if (query) {
		switch (category) {
			case "players": {
				const result = await searchUsersPage(query, page, PAGE_SIZE);
				resultList = <SearchUserList items={result.items} baseDomain={baseDomain}/>;
				total = result.total;
				totalPages = result.totalPages;
				break;
			}
			case "clans": {
				const result = await searchClansPage(query, page, PAGE_SIZE);
				resultList = <SearchClanList items={result.items} baseDomain={baseDomain}/>;
				total = result.total;
				totalPages = result.totalPages;
				break;
			}
			case "beatmaps": {
				const result = await searchBeatmapsPage(query, page, PAGE_SIZE);
				resultList = <SearchBeatmapList items={result.items}/>;
				total = result.total;
				totalPages = result.totalPages;
				break;
			}
		}
		if (page > totalPages) notFound();
	}

	const meta = categoryMeta[category];
	const firstResult = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
	const lastResult = Math.min(page * PAGE_SIZE, total);

	return (
		<div className={styles.page}>
			<section className={styles.hero}>
				<Image className={styles.hero_image}
				       src="/images/banner/search.jpg"
				       alt="Search observatory hero"
				       fill
				       sizes="100vw"
				       priority
				       draggable={false}/>
				<div className={styles.hero_glow}></div>
				<div className={styles.hero_content}>
					<span className={styles.hero_icon}><FontAwesome prefix="fad" name={meta.icon}/></span>
					<div>
						<small>Search results</small>
						<h1>{meta.label}</h1>
						<p>{meta.description}</p>
					</div>
				</div>
			</section>

			<div className={styles.container}>
				<form className={styles.search_form} action={`/search/${category}`} method="get">
					<FontAwesome prefix="fas" name="magnifying-glass"/>
					<input type="search"
					       name="q"
					       defaultValue={query}
					       maxLength={64}
					       autoComplete="off"
					       placeholder={`Search ${meta.label.toLowerCase()}`}
					       aria-label={`Search ${meta.label.toLowerCase()}`}/>
					<button type="submit">Search</button>
				</form>

				<nav className={styles.categories} aria-label="Search categories">
					{(Object.entries(categoryMeta) as [SearchCategory, typeof meta][]).map(([key, item]) =>
						<Link key={key}
						      href={getSearchHref(key, query)}
						      aria-current={key === category ? "page" : undefined}>
							<FontAwesome prefix="fad" name={item.icon}/>
							{item.label}
						</Link>)}
				</nav>

				<section className={styles.results} aria-labelledby="search-results-title" data-page-enter="box">
					<div className={styles.results_heading}>
						<div>
							<small>{query ? `Results for “${query}”` : "Enter a search term"}</small>
							<h2 id="search-results-title">{meta.label}</h2>
						</div>
						{query && <p>
							<strong>{total.toLocaleString("en-US")}</strong> results
							{total > 0 && <span>{firstResult.toLocaleString("en-US")}–{lastResult.toLocaleString("en-US")}</span>}
						</p>}
					</div>

					{!query && <SearchPageMessage icon="magnifying-glass" text={`Search all ${meta.label.toLowerCase()}.`}/>} 
					{query && total === 0 && <SearchPageMessage icon="magnifying-glass-minus" text={`No ${meta.label.toLowerCase()} found.`}/>} 
					{query && total > 0 && resultList}
				</section>

				{query && totalPages > 1 &&
					<SearchPagination category={category}
					                  query={query}
					                  currentPage={page}
					                  totalPages={totalPages}/>} 
			</div>
		</div>
	);
}

function SearchPageMessage({ icon, text }: Readonly<{ icon: string, text: string }>) {
	return (
		<div className={styles.message}>
			<FontAwesome prefix="fad" name={icon}/>
			<p>{text}</p>
		</div>
	);
}

function SearchPagination({ category, query, currentPage, totalPages }: Readonly<{
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
