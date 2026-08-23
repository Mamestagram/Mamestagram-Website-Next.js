"use client";

import classNames from "classnames";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SortBy } from "@/database/leaderboard";
import type { OsuMode } from "@/lib/mode";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/leaderboard.module.css";

const ACCURACY_SORT = "accuracy" as SortBy;
const PLAY_COUNT_SORT = "playcount" as SortBy;
const PERFORMANCE_SORT = "performance" as SortBy;
const SCORE_SORT = "score" as SortBy;
const DANS_SORT = "dans" as SortBy;

const sortOptions = [
	{ value: PERFORMANCE_SORT, label: "Performance", shortLabel: "Performance", icon: "bolt" },
	{ value: SCORE_SORT, label: "Score", shortLabel: "Score", icon: "star" },
	{ value: PLAY_COUNT_SORT, label: "Play Count", shortLabel: "Play Count", icon: "gamepad-modern" },
	{ value: ACCURACY_SORT, label: "Accuracy", shortLabel: "Accuracy", icon: "bullseye" }
] as const;

export default function RankingSortSwitch({ mode, sortBy, country, isClan }: Readonly<{
	mode: OsuMode,
	sortBy: SortBy,
	country?: string,
	isClan: boolean
}>) {
	const [isOpen, setIsOpen] = useState(false);
	const [isMenuMounted, setIsMenuMounted] = useState(false);
	const wrapperRef = useRef<HTMLElement>(null);
	const selectedSort = sortBy === DANS_SORT ? PERFORMANCE_SORT : sortBy;
	const selectedOption = sortOptions.find(({ value }) => value === selectedSort) ?? sortOptions[2];
	const query = [
		isClan ? "clan" : "",
		country !== undefined ? `country=${encodeURIComponent(country)}` : ""
	].filter(Boolean);
	const queryString = query.length > 0 ? `?${query.join("&")}` : "";

	useEffect(() => {
		if (!isOpen) return;

		const closeOnOutsideClick = (event: PointerEvent) => {
			if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsOpen(false);
		};

		document.addEventListener("pointerdown", closeOnOutsideClick);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsideClick);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [isOpen]);

	useEffect(() => {
		if (isOpen || !isMenuMounted) return;
		const unmountTimer = window.setTimeout(() => setIsMenuMounted(false), 260);
		return () => window.clearTimeout(unmountTimer);
	}, [isOpen, isMenuMounted]);

	const toggleMenu = () => {
		if (isOpen) {
			setIsOpen(false);
			return;
		}
		setIsMenuMounted(true);
		setIsOpen(true);
	};

	return (
		<nav ref={wrapperRef}
		     className={classNames(styles.selection_wrapper, styles.compact_mode_selection, styles.ranking_sort_control)}
		     data-sort={selectedOption.value}
		     aria-label="Ranking category">
			<button type="button"
			        className={styles.leaderboard_mode_trigger}
			        aria-label={`Select ranking category. Current: ${selectedOption.label}`}
			        aria-haspopup="menu"
			        aria-expanded={isOpen}
			        onClick={toggleMenu}>
				<FontAwesome prefix="fad" name={selectedOption.icon}/>
				<span className={styles.leaderboard_mode_name}>
					<strong>{selectedOption.shortLabel}</strong>
				</span>
				<FontAwesome className={styles.leaderboard_mode_chevron} prefix="fas" name="chevron-right"/>
			</button>

			{isMenuMounted &&
				<div className={classNames(styles.leaderboard_mode_menu, styles.ranking_sort_menu)}
				     role="menu"
				     data-state={isOpen ? "open" : "closed"}
				     onAnimationEnd={(event) => {
					     if (event.target === event.currentTarget && !isOpen) setIsMenuMounted(false);
				     }}>
					<section className={styles.leaderboard_mode_group}>
						<h2><FontAwesome prefix="fad" name="ranking-star"/>Rank by</h2>
						<div className={styles.leaderboard_playstyles}>
							{sortOptions.map((option) => {
								const isSelected = selectedSort === option.value;
								const destinationSort = sortBy === DANS_SORT && option.value === PERFORMANCE_SORT
									? DANS_SORT
									: option.value;
								return (
									<Link key={option.value}
									      href={`/leaderboard/${mode}/${destinationSort}${queryString}`}
									      data-sort={option.value}
									      role="menuitem"
									      aria-current={isSelected ? "page" : undefined}
									      className={classNames({ [styles.selected_playstyle]: isSelected })}
									      onClick={() => setIsOpen(false)}>
										<FontAwesome prefix="fad" name={option.icon}/>{option.shortLabel}
									</Link>
								);
							})}
						</div>
					</section>
				</div>}
		</nav>
	);
}
