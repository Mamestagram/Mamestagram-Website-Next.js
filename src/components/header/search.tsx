"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useHeaderSearch } from "@/components/context/header-search-provider";
import { useUserContext } from "@/components/context/user-provider";
import FontAwesome from "@/components/font-awesome";
import { modeAbbreviation, type ModeNum } from "@/lib/mode";
import { Priv } from "@/lib/priv";
import styles from "@s/header-search.module.css";

type SearchUser = {
	id: number,
	name: string,
	country: string,
	preferredMode: number,
	privileges: number[]
};

type SearchResponse = {
	users: SearchUser[],
	error?: string
};

type SearchPhase = "idle" | "loading" | "ready" | "error";

const privilegeLabels: Partial<Record<Priv, string>> = {
	[Priv.verified]: "Verified",
	[Priv.supporter]: "Supporter",
	[Priv.premium]: "Premium",
	[Priv.alumni]: "Alumni",
	[Priv.tourneyManager]: "Tournament Manager",
	[Priv.nominator]: "Nominator",
	[Priv.moderator]: "Moderator",
	[Priv.administrator]: "Administrator",
	[Priv.developer]: "Developer"
};

const getPrivilegeLabels = (privileges: number[]) => privileges.flatMap((privilege) => {
	const label = privilegeLabels[privilege as Priv];
	return label ? [label] : [];
});

export function HeaderSearchTrigger({ location }: { location: "top" | "navigation" }) {
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

export default function HeaderSearch() {
	const router = useRouter();
	const { serverInfo } = useUserContext();
	const { isOpen, closeSearch } = useHeaderSearch();
	const [mounted, setMounted] = useState(false);
	const [query, setQuery] = useState("");
	const [users, setUsers] = useState<SearchUser[]>([]);
	const [phase, setPhase] = useState<SearchPhase>("idle");
	const [message, setMessage] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const dialogRef = useRef<HTMLElement>(null);

	useEffect(() => setMounted(true), []);

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
		if (!trimmed) {
			setUsers([]);
			setPhase("idle");
			setMessage("");
			return;
		}

		const controller = new AbortController();
		const timeout = window.setTimeout(async () => {
			setPhase("loading");
			setMessage("");
			try {
				const response = await fetch(`/api/search/users?q=${encodeURIComponent(trimmed)}`, {
					signal: controller.signal
				});
				const data = await response.json() as SearchResponse;
				if (!response.ok) throw new Error(data.error);
				setUsers(data.users);
				setPhase("ready");
			}
			catch (error) {
				if (controller.signal.aborted) return;
				setUsers([]);
				setPhase("error");
				setMessage(error instanceof Error && error.message
					? error.message
					: "Player search is temporarily unavailable.");
			}
		}, 220);

		return () => {
			window.clearTimeout(timeout);
			controller.abort();
		};
	}, [query]);

	const visitFirstResult = () => {
		if (!users[0]) return;
		closeSearch();
		router.push(`/profile/${users[0].id}`);
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
			         data-expanded={phase === "loading" || (phase === "ready" && users.length > 0)}
			         role="dialog"
			         aria-modal="true"
			         aria-labelledby="header-search-title">
				<div className={styles.heading}>
					<span className={styles.heading_icon}><FontAwesome prefix="fad" name="magnifying-glass"/></span>
					<span>
						<small>Find what you need</small>
						<strong id="header-search-title">Search</strong>
					</span>
					<button type="button" aria-label="Close search" onClick={closeSearch}>
						<FontAwesome prefix="fas" name="xmark"/>
					</button>
				</div>

				<div className={styles.category_bar}>
					<span><FontAwesome prefix="fad" name="users"/>Players</span>
					<small>More search categories will be added later.</small>
				</div>

				<form className={styles.search_form} onSubmit={(event) => {
					event.preventDefault();
					visitFirstResult();
				}}>
					<FontAwesome prefix="fas" name="magnifying-glass"/>
					<input ref={inputRef}
					       type="search"
					       value={query}
					       maxLength={64}
					       autoComplete="off"
					       placeholder="Search players by name or ID"
					       aria-label="Search players by name or ID"
					       onChange={(event) => setQuery(event.target.value)}/>
					{phase === "loading" && <FontAwesome className={styles.spinner} prefix="fas" name="spinner"/>}
					{query && phase !== "loading" &&
						<button type="button" aria-label="Clear search" onClick={() => {
							setQuery("");
							inputRef.current?.focus();
						}}>
							<FontAwesome prefix="fas" name="circle-xmark"/>
						</button>}
				</form>

				<div className={styles.results} aria-live="polite" aria-busy={phase === "loading"}>
					{phase === "idle" && <SearchMessage icon="user-magnifying-glass"
					                                      title="Search Mamestagram players"
					                                      body="Enter a username or player ID to open their profile."/>}
					{phase === "loading" && <SearchSkeleton/>}
					{phase === "error" && <SearchMessage icon="triangle-exclamation" title="Search unavailable" body={message}/>} 
					{phase === "ready" && users.length === 0 && <SearchMessage icon="users-slash"
					                                                              title="No players found"
					                                                              body="Try another username or player ID."/>}
					{phase === "ready" && users.length > 0 &&
						<ul className={styles.result_list}>
							{users.map((user) =>
								<li key={user.id}>
									<Link href={`/profile/${user.id}`} onClick={closeSearch}>
										<span className={styles.avatar}>
											<Image src={`https://a.${serverInfo.baseDomain}/${user.id}`}
											       alt=""
											       fill
											       sizes="48px"
											       draggable={false}/>
										</span>
										<span className={styles.identity}>
											<span className={styles.name_with_tooltip}>
												<strong>{user.name}</strong>
												<span className={styles.name_tooltip} role="tooltip">{user.name}</span>
											</span>
											<small>Player #{user.id.toLocaleString("en-US")}</small>
										</span>
										<span className={styles.meta}>
											<span className={styles.meta_primary}>
												<small className={styles.country}>
													<i className={`fi fi-${user.country.toLowerCase()}`}></i>
													{user.country.toUpperCase()}
												</small>
												<small>{modeAbbreviation(user.preferredMode as ModeNum)}</small>
											</span>
											<small className={styles.privilege}
											       title={getPrivilegeLabels(user.privileges).join(", ") || "Player"}>
												<FontAwesome prefix="fas" name="shield-halved"/>
												{getPrivilegeLabels(user.privileges).at(-1) ?? "Player"}
											</small>
										</span>
										<FontAwesome className={styles.open_icon} prefix="fas" name="chevron-right"/>
									</Link>
								</li>)}
						</ul>}
				</div>

				<div className={styles.hint}>
					<span><kbd>Enter</kbd> Open first result</span>
					<span><kbd>Esc</kbd> Close</span>
				</div>
			</section>
		</div>
	);

	return mounted ? createPortal(dialog, document.body) : null;
}

function SearchMessage({ icon, title, body }: { icon: string, title: string, body: string }) {
	return (
		<div className={styles.message}>
			<FontAwesome prefix="fad" name={icon}/>
			<strong>{title}</strong>
			<p>{body}</p>
		</div>
	);
}

function SearchSkeleton() {
	return (
		<ul className={styles.skeleton_list} aria-hidden="true">
			{Array.from({ length: 9 }, (_, index) =>
				<li key={index}>
					<span className={styles.skeleton_avatar}></span>
					<span className={styles.skeleton_identity}>
						<i></i>
						<i></i>
					</span>
					<span className={styles.skeleton_meta}>
						<span className={styles.skeleton_meta_primary}>
							<i></i>
							<i></i>
						</span>
						<i></i>
					</span>
				</li>)}
		</ul>
	);
}
