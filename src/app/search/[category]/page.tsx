import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import FontAwesome from "@/components/font-awesome";
import FormattedNumber from "@/components/formatted-number";
import SearchBeatmapList from "@/components/search/search-beatmap-list";
import SearchClanList from "@/components/search/search-clan-list";
import SearchPageMessage from "@/components/search/search-page-message";
import SearchPagination from "@/components/search/search-pagination";
import SearchUserList from "@/components/search/search-user-list";
import { searchBeatmapsPage, searchClansPage, searchUsersPage } from "@/database/search";
import { writeLog } from "@/lib/log";
import { getSearchHref, isSearchCategory, searchCategoryMeta, type SearchCategory } from "@/lib/search-route";
import styles from "@s/search.module.css";

const PAGE_SIZE = 48;

export async function generateMetadata({ params }: {
	params: Promise<{ category: string }>
}): Promise<Metadata> {
	const { category } = await params;
	return { title: isSearchCategory(category) ? `Search ${searchCategoryMeta[category].label}` : "Search" };
}

export default async function SearchResultsPage({ params, searchParams }: {
	params: Promise<{ category: string }>,
	searchParams: Promise<{ q?: string, page?: string }>
}) {
	const { category } = await params;
	const { q = "", page: pageParam = "1" } = await searchParams;
	void writeLog("GET", `/search/${category} (q: ${q}, page: ${pageParam})`);
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
				resultList = <SearchBeatmapList items={result.items} columns={2}/>;
				total = result.total;
				totalPages = result.totalPages;
				break;
			}
		}
		if (page > totalPages) notFound();
	}
	
	const meta = searchCategoryMeta[category];
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
					{(Object.entries(searchCategoryMeta) as [SearchCategory, typeof meta][]).map(([key, item]) =>
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
							{!query && <small>Enter a search term</small>}
							<h2 id="search-results-title">{meta.label}</h2>
						</div>
						{query && <p>
							<strong><FormattedNumber value={total}/></strong> results
							{total > 0 && <span><FormattedNumber value={firstResult}/>–<FormattedNumber
								value={lastResult}/></span>}
						</p>}
					</div>
					
					{!query &&
						<SearchPageMessage icon="magnifying-glass" text={`Search all ${meta.label.toLowerCase()}.`}/>}
					{query && total === 0 && <SearchPageMessage icon="magnifying-glass-minus"
					                                            text={`No ${meta.label.toLowerCase()} found.`}/>}
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
