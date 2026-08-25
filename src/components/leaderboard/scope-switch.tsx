"use client";

import classNames from "classnames";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SortBy } from "@/database/leaderboard";
import type { OsuMode } from "@/lib/mode";
import { useUserContext } from "@/components/context/user-provider";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/leaderboard.module.css";

const getCountryName = (country: string) => {
	try {
		return new Intl.DisplayNames(["en"], { type: "region" }).of(country.toUpperCase()) ?? country.toUpperCase();
	} catch {
		return country.toUpperCase();
	}
};

export default function LeaderboardScopeSwitch({ mode, sortBy, countries, country, isClan }: {
	mode: OsuMode,
	sortBy: SortBy,
	countries: string[],
	country?: string,
	isClan: boolean
}) {
	const { userInfo } = useUserContext();
	const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
	const switchRef = useRef<HTMLElement>(null);
	const basePath = `/leaderboard/${mode}/${sortBy}`;
	const preferredCountry = userInfo.isLoggedIn ? userInfo.country?.trim().toLowerCase() : undefined;
	const countryOptions = useMemo(() => countries.map((code) => ({
		code,
		name: getCountryName(code)
	})).sort((first, second) => {
		if (first.code === preferredCountry) return -1;
		if (second.code === preferredCountry) return 1;
		return first.name.localeCompare(second.name);
	}), [countries, preferredCountry]);
	const selectedScope = isClan ? "clans" : country ? "country" : "global";
	
	useEffect(() => {
		if (!isCountryMenuOpen) return;
		
		const closeOnOutsideClick = (event: PointerEvent) => {
			if (!switchRef.current?.contains(event.target as Node)) setIsCountryMenuOpen(false);
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsCountryMenuOpen(false);
		};
		
		document.addEventListener("pointerdown", closeOnOutsideClick);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsideClick);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [isCountryMenuOpen]);
	
	return (
		<nav ref={switchRef}
		     className={styles.leaderboard_scope_switch}
		     data-scope={selectedScope}
		     data-page-enter="box"
		     aria-label="Leaderboard type">
			<Link href={basePath}
			      aria-current={selectedScope === "global" ? "page" : undefined}
			      className={classNames({ [styles.selected_scope]: selectedScope === "global" })}>
				<FontAwesome prefix="fas" name="earth-americas"/>
				<span>Global</span>
			</Link>
			<button type="button"
			        aria-haspopup="menu"
			        aria-expanded={isCountryMenuOpen}
			        className={classNames({ [styles.selected_scope]: selectedScope === "country" })}
			        onClick={() => setIsCountryMenuOpen((isOpen) => !isOpen)}>
				{country
					? <i className={`fi fi-${country}`} aria-hidden="true"/>
					: <FontAwesome prefix="fas" name="flag"/>}
				<span>Country</span>
			</button>
			<Link href={`${basePath}?clan`}
			      aria-current={selectedScope === "clans" ? "page" : undefined}
			      className={classNames({ [styles.selected_scope]: selectedScope === "clans" })}>
				<FontAwesome prefix="fas" name="people-group"/>
				<span>Clans</span>
			</Link>
			{isCountryMenuOpen &&
				<div className={styles.country_ranking_menu} role="menu">
					<div className={styles.country_ranking_heading}>
						<strong>Country ranking</strong>
					</div>
					<div className={styles.country_ranking_options}>
						{countryOptions.map((option) =>
							<Link key={option.code}
							      href={`${basePath}?country=${encodeURIComponent(option.code)}`}
							      role="menuitem"
							      aria-current={country === option.code ? "page" : undefined}
							      className={classNames({ [styles.selected_country]: country === option.code })}
							      onClick={() => setIsCountryMenuOpen(false)}>
								<i className={`fi fi-${option.code}`} aria-hidden="true"/>
								<span>{option.name}</span>
							</Link>
						)}
					</div>
				</div>}
		</nav>
	);
}
