"use client";

import classNames from "classnames";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SortBy } from "@/database/leaderboard";
import type { OsuMode } from "@/lib/mode";
import FontAwesome from "@/components/font-awesome";
import {
	getLeaderboardBaseMode,
	getLeaderboardModeGroup,
	getLeaderboardPlaystyle,
	LEADERBOARD_DANS_SORT,
	LEADERBOARD_PERFORMANCE_SORT,
	type LeaderboardModeOption
} from "@/components/leaderboard/leaderboard-mode-options";
import styles from "@s/leaderboard.module.css";

export default function ModeSelection({ mode, sortBy, country, isClan }: {
	mode: OsuMode,
	sortBy: SortBy,
	country: string | undefined,
	isClan: boolean
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [isMenuMounted, setIsMenuMounted] = useState(false);
	const wrapperRef = useRef<HTMLElement>(null);
	const baseMode = getLeaderboardBaseMode(mode);
	const activeGroup = getLeaderboardModeGroup(baseMode);
	const playstyleLabel = getLeaderboardPlaystyle(mode, sortBy);
	const activeOption = activeGroup.options.find(({ label }) => label === playstyleLabel) ?? activeGroup.options[0];
	const referenceSort = sortBy === LEADERBOARD_DANS_SORT ? LEADERBOARD_PERFORMANCE_SORT : sortBy;
	
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
	
	const getHref = (option: LeaderboardModeOption) => {
		const query = [
			isClan ? "clan" : "",
			country !== undefined ? `country=${encodeURIComponent(country)}` : ""
		].filter(Boolean);
		const destinationSort = option.dans ? LEADERBOARD_DANS_SORT : referenceSort;
		return `/leaderboard/${option.mode}/${destinationSort}${query.length > 0 ? `?${query.join("&")}` : ""}`;
	};
	
	return (
		<aside ref={wrapperRef}
		       data-playstyle={playstyleLabel}
		       className={classNames(styles.selection_wrapper, styles.compact_mode_selection, styles.playstyle_selection)}>
			<button type="button"
			        className={styles.leaderboard_mode_trigger}
			        aria-label={`Select playstyle. Current: ${playstyleLabel}`}
			        aria-haspopup="menu"
			        aria-expanded={isOpen}
			        onClick={toggleMenu}>
				<FontAwesome prefix="fad" name={activeOption.icon}/>
				<span className={styles.leaderboard_mode_name}>
					<strong>{playstyleLabel}</strong>
				</span>
				<FontAwesome className={styles.leaderboard_mode_chevron} prefix="fas" name="chevron-right"/>
			</button>
			
			{isMenuMounted &&
				<div className={styles.leaderboard_mode_menu}
				     role="menu"
				     data-state={isOpen ? "open" : "closed"}
				     onAnimationEnd={(event) => {
					     if (event.target === event.currentTarget && !isOpen) setIsMenuMounted(false);
				     }}>
					<section className={styles.leaderboard_mode_group}>
						<div className={styles.leaderboard_playstyles}>
							{activeGroup.options.map((option) => {
								const selected = option.mode === mode && Boolean(option.dans) === (sortBy === LEADERBOARD_DANS_SORT);
								return (
									<Link key={`${option.mode}-${option.label}`}
									      href={getHref(option)}
									      data-playstyle={option.label}
									      role="menuitem"
									      aria-current={selected ? "page" : undefined}
									      className={classNames({ [styles.selected_playstyle]: selected })}
									      onClick={() => setIsOpen(false)}>
										<FontAwesome prefix="fad" name={option.icon}/>{option.label}
									</Link>
								);
							})}
						</div>
					</section>
				</div>}
		</aside>
	);
}
