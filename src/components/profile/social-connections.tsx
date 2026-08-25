"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { ProfileConnection } from "@/database/profile";
import CountryFlag from "@/components/country-flag";
import FontAwesome from "@/components/font-awesome";
import FormattedNumber from "@/components/formatted-number";
import PlayerAvatar from "@/components/player-avatar";
import type { ProfileCosmetics } from "@/lib/profile-cosmetics";
import styles from "@s/profile.module.css";

type ConnectionType = "mutual" | "following" | "followers";
type ProfileCosmeticsResponse = { cosmetics: ProfileCosmetics[] };

const socialMeta: Record<ConnectionType, {
	label: string,
	icon: string
}> = {
	mutual: {
		label: "Mutual",
		icon: "user-group"
	},
	following: {
		label: "Following",
		icon: "user-plus"
	},
	followers: {
		label: "Followers",
		icon: "users"
	}
};

export default function SocialConnections({ connections, mode, baseDomain }: {
	connections: Record<ConnectionType, ProfileConnection[]>,
	mode: string,
	baseDomain: string
}) {
	const [activeType, setActiveType] = useState<ConnectionType | null>(null);
	const [query, setQuery] = useState("");
	const [cosmeticsByUser, setCosmeticsByUser] = useState<Record<number, ProfileCosmetics>>({});
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const modalRef = useRef<HTMLElement>(null);
	const returnFocusRef = useRef<HTMLElement | null>(null);
	const activeConnections = useMemo(
		() => activeType ? connections[activeType] : [],
		[activeType, connections]
	);
	const filteredConnections = useMemo(() => {
		const normalizedQuery = query.trim().toLocaleLowerCase();
		if (!normalizedQuery) return activeConnections;
		return activeConnections.filter(({ name, user }) =>
			name.toLocaleLowerCase().includes(normalizedQuery) || String(user).includes(normalizedQuery)
		);
	}, [activeConnections, query]);
	
	useEffect(() => {
		if (!activeType) return;
		const missingIds = activeConnections
			.map(({ user }) => user)
			.filter((userId) => cosmeticsByUser[userId] === undefined);
		if (missingIds.length === 0) return;
		const controller = new AbortController();
		const batchSize = 80;
		const requests = Array.from({ length: Math.ceil(missingIds.length / batchSize) }, (_, index) => {
			const ids = missingIds.slice(index * batchSize, (index + 1) * batchSize).join(",");
			return fetch(`/api/profile-cosmetics?ids=${encodeURIComponent(ids)}`, { signal: controller.signal })
				.then((response) => response.json() as Promise<ProfileCosmeticsResponse>);
		});
		void Promise.all(requests).then((responses) => {
			setCosmeticsByUser((current) => {
				const next = { ...current };
				responses.flatMap(({ cosmetics }) => cosmetics).forEach((cosmetics) => {
					next[cosmetics.userId] = cosmetics;
				});
				return next;
			});
		}).catch((error: unknown) => {
			if (!(error instanceof DOMException && error.name === "AbortError"))
				console.error("Failed to load connection cosmetics.", error);
		});
		return () => controller.abort();
	}, [activeConnections, activeType, cosmeticsByUser]);
	
	useEffect(() => {
		if (!activeType) return;
		const previousOverflow = document.body.style.overflow;
		const handleModalKeys = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setActiveType(null);
				return;
			}
			if (event.key !== "Tab" || !modalRef.current) return;
			
			const focusable = modalRef.current.querySelectorAll<HTMLElement>(
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
		document.addEventListener("keydown", handleModalKeys);
		requestAnimationFrame(() => closeButtonRef.current?.focus());
		
		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", handleModalKeys);
			requestAnimationFrame(() => returnFocusRef.current?.focus());
		};
	}, [activeType]);
	
	const openConnections = (type: ConnectionType) => {
		returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		setQuery("");
		setActiveType(type);
	};
	
	const closeConnections = () => {
		setActiveType(null);
		setQuery("");
	};
	
	return (
		<>
			<ul className={styles.social_strip}>
				{(Object.keys(socialMeta) as ConnectionType[]).map((type) => {
					const { label, icon } = socialMeta[type];
					return (
						<li key={type} data-social={type}>
							<button className={styles.social_card}
							        type="button"
							        aria-haspopup="dialog"
							        onClick={() => openConnections(type)}>
								<span className={styles.social_icon}>
									<FontAwesome prefix="fad" name={icon}/>
								</span>
								<span className={styles.social_copy}>
									<strong>{label}</strong>
								</span>
								<span className={styles.social_value}><FormattedNumber
									value={connections[type].length}/></span>
								<FontAwesome className={styles.social_open_icon} prefix="fas" name="arrow-up-right"/>
							</button>
						</li>
					);
				})}
			</ul>
			
			{activeType && createPortal(
				<div className={styles.social_modal_overlay}
				     role="presentation"
				     onMouseDown={(event) => {
					     if (event.target === event.currentTarget) closeConnections();
				     }}>
					<section ref={modalRef}
					         className={styles.social_modal}
					         role="dialog"
					         aria-modal="true"
					         aria-labelledby="social-connections-title">
						<div className={styles.social_modal_header} data-social={activeType}>
							<span className={styles.social_modal_identity}>
								<span className={styles.social_modal_icon}>
									<FontAwesome prefix="fad" name={socialMeta[activeType].icon}/>
								</span>
								<span>
									<strong id="social-connections-title">{socialMeta[activeType].label}</strong>
								</span>
							</span>
							<span className={styles.social_modal_count}><FormattedNumber
								value={activeConnections.length}/></span>
							<button ref={closeButtonRef}
							        className={styles.social_modal_close}
							        type="button"
							        aria-label="Close connections"
							        onClick={closeConnections}>
								<FontAwesome prefix="fas" name="xmark"/>
							</button>
						</div>
						
						<label className={styles.social_modal_search}>
							<FontAwesome prefix="fas" name="magnifying-glass"/>
							<input type="search"
							       value={query}
							       placeholder="Search by name or ID"
							       aria-label="Search connections"
							       onChange={(event) => setQuery(event.target.value)}/>
							{query &&
								<button type="button" aria-label="Clear search" onClick={() => setQuery("")}>
									<FontAwesome prefix="fas" name="circle-xmark"/>
								</button>}
						</label>
						
						<div className={styles.social_modal_body}>
							{filteredConnections.length > 0 ? (
								<ul className={styles.connection_list}>
									{filteredConnections.map((connection) =>
										<li key={connection.user} data-rendering-item="compact">
											<Link href={`/profile/${connection.user}/${mode}`}
											      onClick={closeConnections}>
												<PlayerAvatar userId={connection.user}
												              name={connection.name}
												              baseDomain={baseDomain}
												              cosmetics={cosmeticsByUser[connection.user] ?? null}
												              className={styles.connection_avatar}
												              sizes="44px"/>
												<span className={styles.connection_identity}>
													<strong>{connection.name}</strong>
													<small>Player #<FormattedNumber value={connection.user}/></small>
												</span>
												<CountryFlag className={styles.connection_country}
												             code={connection.country}/>
												<FontAwesome className={styles.connection_open_icon} prefix="fas"
												             name="chevron-right"/>
											</Link>
										</li>)}
								</ul>
							) : (
								<div className={styles.connection_empty}>
									<FontAwesome prefix="fad" name={query ? "user-magnifying-glass" : "users-slash"}/>
									<strong>{query ? "No players found" : `No ${socialMeta[activeType].label.toLowerCase()} yet`}</strong>
									<small>{query ? "Try another name or player ID." : "This list is currently empty."}</small>
								</div>
							)}
						</div>
					</section>
				</div>,
				document.body
			)}
		</>
	);
}
