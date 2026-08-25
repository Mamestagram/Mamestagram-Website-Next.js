"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useHeaderSearch } from "@/components/context/header-search-provider";
import { useUserContext } from "@/components/context/user-provider";
import FontAwesome from "@/components/font-awesome";
import SearchBeatmapResults from "@/components/header/search-beatmap-results";
import SearchClanResults from "@/components/header/search-clan-results";
import SearchMessage from "@/components/header/search-message";
import SearchSkeleton from "@/components/header/search-skeleton";
import SearchUserResults from "@/components/header/search-user-results";
import type { SearchResponse } from "@/lib/search";
import styles from "@s/header-search.module.css";

type SearchPhase = "idle" | "loading" | "ready" | "error";

const emptyResults: SearchResponse = {
	users: [],
	clans: [],
	beatmaps: [],
	totals: { users: 0, clans: 0, beatmaps: 0 }
};
const SEARCH_CACHE_TTL_MS = 30_000;
const SEARCH_CACHE_LIMIT = 20;
const searchResultCache = new Map<string, { data: SearchResponse, expiresAt: number }>();

const normalizeSearchResponse = (data: SearchResponse): SearchResponse => ({
	users: data.users ?? [],
	clans: data.clans ?? [],
	beatmaps: data.beatmaps ?? [],
	totals: data.totals ?? {
		users: data.users?.length ?? 0,
		clans: data.clans?.length ?? 0,
		beatmaps: data.beatmaps?.length ?? 0
	}
});

const getCachedSearch = (query: string) => {
	const cached = searchResultCache.get(query);
	if (!cached) return null;
	if (cached.expiresAt <= Date.now()) {
		searchResultCache.delete(query);
		return null;
	}
	return cached.data;
};

const cacheSearch = (query: string, data: SearchResponse) => {
	searchResultCache.delete(query);
	searchResultCache.set(query, { data, expiresAt: Date.now() + SEARCH_CACHE_TTL_MS });
	while (searchResultCache.size > SEARCH_CACHE_LIMIT) {
		const oldestKey = searchResultCache.keys().next().value;
		if (oldestKey === undefined) break;
		searchResultCache.delete(oldestKey);
	}
};

const subscribeToClient = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function HeaderSearch() {
	const router = useRouter();
	const { serverInfo } = useUserContext();
	const { isOpen, closeSearch } = useHeaderSearch();
	const isClient = useSyncExternalStore(subscribeToClient, getClientSnapshot, getServerSnapshot);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResponse>(emptyResults);
	const [phase, setPhase] = useState<SearchPhase>("idle");
	const [message, setMessage] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const dialogRef = useRef<HTMLElement>(null);
	
	const updateQuery = (nextQuery: string) => {
		setQuery(nextQuery);
		if (nextQuery.trim()) return;
		setResults(emptyResults);
		setPhase("idle");
		setMessage("");
	};
	
	useEffect(() => {
		if (!isOpen) return;
		
		const previousOverflow = document.body.style.overflow;
		requestAnimationFrame(() => inputRef.current?.focus());
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				closeSearch();
				return;
			}
			if (event.key !== "Tab" || !dialogRef.current) return;
			
			const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
			);
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (!first || !last) return;
			
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			}
			else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};
		
		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [closeSearch, isOpen]);
	
	useEffect(() => {
		const trimmed = query.trim();
		if (!trimmed) return;
		const cacheKey = trimmed.toLocaleLowerCase();
		const cached = getCachedSearch(cacheKey);
		if (cached) {
			const cacheFrame = window.requestAnimationFrame(() => {
				setResults(cached);
				setPhase("ready");
				setMessage("");
			});
			return () => window.cancelAnimationFrame(cacheFrame);
		}
		
		const controller = new AbortController();
		const timeout = window.setTimeout(async () => {
			setPhase("loading");
			setMessage("");
			try {
				const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
					signal: controller.signal
				});
				const data = await response.json() as SearchResponse;
				if (!response.ok) {
					setResults(emptyResults);
					setPhase("error");
					setMessage(data.error || "Search is temporarily unavailable.");
					return;
				}
				const normalizedResults = normalizeSearchResponse(data);
				cacheSearch(cacheKey, normalizedResults);
				setResults(normalizedResults);
				setPhase("ready");
			} catch (error) {
				if (controller.signal.aborted) return;
				setResults(emptyResults);
				setPhase("error");
				setMessage(error instanceof Error && error.message
					? error.message
					: "Search is temporarily unavailable.");
			}
		}, 220);
		
		return () => {
			window.clearTimeout(timeout);
			controller.abort();
		};
	}, [query]);
	
	const users = results.users ?? [];
	const clans = results.clans ?? [];
	const beatmaps = results.beatmaps ?? [];
	const visibleResultCount = users.length + clans.length + beatmaps.length;
	const hasResults = users.length > 0 || clans.length > 0 || beatmaps.length > 0;
	const hasManyResults = phase === "ready" && visibleResultCount > 6;
	
	const visitSearchPage = () => {
		const trimmed = query.trim();
		if (!trimmed) return;
		closeSearch();
		router.push(`/search/players?q=${encodeURIComponent(trimmed)}`);
	};
	
	const dialog = (
		<div className={styles.overlay}
		     data-open={isOpen}
		     aria-hidden={!isOpen}
		     onMouseDown={(event) => {
			     if (event.target === event.currentTarget) closeSearch();
		     }}>
			<section ref={dialogRef}
			         className={styles.dialog}
			         data-expanded={phase === "loading" || (phase === "ready" && hasResults)}
			         data-tall={hasManyResults}
			         role="dialog"
			         aria-modal="true"
			         aria-labelledby="header-search-title">
				<div className={styles.heading}>
					<span className={styles.heading_icon}><FontAwesome prefix="fad" name="magnifying-glass"/></span>
					<span>
						<strong id="header-search-title">Search</strong>
					</span>
					<button type="button" aria-label="Close search" onClick={closeSearch}>
						<FontAwesome prefix="fas" name="xmark"/>
					</button>
				</div>
				
				<div className={styles.category_bar}>
					<span><FontAwesome prefix="fad" name="users"/>Players</span>
					<span><FontAwesome prefix="fad" name="people-group"/>Clans</span>
					<span><FontAwesome prefix="fad" name="compact-disc"/>Beatmaps</span>
				</div>
				
				<form className={styles.search_form} onSubmit={(event) => {
					event.preventDefault();
					visitSearchPage();
				}}>
					<FontAwesome prefix="fas" name="magnifying-glass"/>
					<input ref={inputRef}
					       type="search"
					       value={query}
					       maxLength={64}
					       autoComplete="off"
					       placeholder="Search players, clans, or beatmaps"
					       aria-label="Search players, clans, or beatmaps"
					       onChange={(event) => updateQuery(event.target.value)}/>
					{phase === "loading" && <FontAwesome className={styles.spinner} prefix="fas" name="spinner"/>}
					{query && phase !== "loading" &&
						<button type="button" aria-label="Clear search" onClick={() => {
							updateQuery("");
							inputRef.current?.focus();
						}}>
							<FontAwesome prefix="fas" name="circle-xmark"/>
						</button>}
				</form>
				
				<div className={styles.results} aria-live="polite" aria-busy={phase === "loading"}>
					{phase === "idle" && <SearchMessage icon="magnifying-glass"
					                                    body="Search players, clans, and beatmaps by name, tag, title, or ID."/>}
					{phase === "loading" && <SearchSkeleton/>}
					{phase === "error" &&
						<SearchMessage icon="triangle-exclamation" title="Search unavailable" body={message}/>}
					{phase === "ready" && !hasResults && <SearchMessage icon="magnifying-glass-minus"
					                                                    title="No results found"
					                                                    body="Try another player name, clan tag, beatmap title, artist, creator, difficulty, or ID."/>}
					{phase === "ready" && hasResults &&
						<div className={styles.result_groups}>
							{users.length > 0 &&
								<SearchUserResults users={users}
								                   baseDomain={serverInfo.baseDomain}
								                   query={query.trim()}
								                   total={results.totals?.users ?? users.length}
								                   onSelect={closeSearch}/>}
							{clans.length > 0 &&
								<SearchClanResults clans={clans}
								                   baseDomain={serverInfo.baseDomain}
								                   query={query.trim()}
								                   total={results.totals?.clans ?? clans.length}
								                   onSelect={closeSearch}/>}
							{beatmaps.length > 0 &&
								<SearchBeatmapResults beatmaps={beatmaps}
								                      query={query.trim()}
								                      total={results.totals?.beatmaps ?? beatmaps.length}
								                      onSelect={closeSearch}/>}
						</div>}
				</div>
				
				<div className={styles.hint}>
					<span><kbd>Enter</kbd> Open search results</span>
					<span><kbd>Esc</kbd> Close</span>
				</div>
			</section>
		</div>
	);
	
	return isClient ? createPortal(dialog, document.body) : null;
}
