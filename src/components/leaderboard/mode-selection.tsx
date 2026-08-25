"use client";

import classNames from "classnames";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SortBy } from "@/database/leaderboard";
import { OsuMode, type VnMode } from "@/lib/mode";
import FontAwesome from "@/components/font-awesome";
import ModeIcon from "@/components/mode-icon";
import styles from "@s/leaderboard.module.css";

const DANS_SORT = "dans" as SortBy;
const PERFORMANCE_SORT = "performance" as SortBy;

type ModeOption = {
	label: string,
	mode: OsuMode,
	dans?: boolean
};

type ModeGroup = {
	label: string,
	mode: VnMode,
	options: ModeOption[]
};

const modeGroups: ModeGroup[] = [
	{
		label: "STD",
		mode: OsuMode.std,
		options: [
			{ label: "Vanilla", mode: OsuMode.std },
			{ label: "Relax", mode: OsuMode.rxstd },
			{ label: "AutoPilot", mode: OsuMode.apstd },
			{ label: "Dans", mode: OsuMode.std, dans: true }
		]
	},
	{
		label: "Taiko",
		mode: OsuMode.taiko,
		options: [
			{ label: "Vanilla", mode: OsuMode.taiko },
			{ label: "Relax", mode: OsuMode.rxtaiko },
			{ label: "Dans", mode: OsuMode.taiko, dans: true }
		]
	},
	{
		label: "Catch",
		mode: OsuMode.ctb,
		options: [
			{ label: "Vanilla", mode: OsuMode.ctb },
			{ label: "Relax", mode: OsuMode.rxctb },
			{ label: "Dans", mode: OsuMode.ctb, dans: true }
		]
	},
	{
		label: "Mania",
		mode: OsuMode.mania,
		options: [
			{ label: "Vanilla", mode: OsuMode.mania },
			{ label: "Dans", mode: OsuMode.mania, dans: true }
		]
	}
];

function getBaseMode(mode: OsuMode): VnMode {
	if ([OsuMode.std, OsuMode.rxstd, OsuMode.apstd].includes(mode)) return OsuMode.std;
	if ([OsuMode.taiko, OsuMode.rxtaiko].includes(mode)) return OsuMode.taiko;
	if ([OsuMode.ctb, OsuMode.rxctb].includes(mode)) return OsuMode.ctb;
	return OsuMode.mania;
}

function getPlaystyleLabel(mode: OsuMode, sortBy: SortBy) {
	if (sortBy === DANS_SORT) return "Dans";
	if ([OsuMode.rxstd, OsuMode.rxtaiko, OsuMode.rxctb].includes(mode)) return "Relax";
	if (mode === OsuMode.apstd) return "AutoPilot";
	return "Vanilla";
}

export default function ModeSelection({ mode, sortBy, country, isClan }: {
	mode: OsuMode,
	sortBy: SortBy,
	country: string | undefined,
	isClan: boolean
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [isMenuMounted, setIsMenuMounted] = useState(false);
	const wrapperRef = useRef<HTMLElement>(null);
	const baseMode = getBaseMode(mode);
	const modeLabel = modeGroups.find((group) => group.mode === baseMode)?.label ?? "Mode";
	const playstyleLabel = getPlaystyleLabel(mode, sortBy);
	const referenceSort = sortBy === DANS_SORT ? PERFORMANCE_SORT : sortBy;
	
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
	
	const getHref = (option: ModeOption) => {
		const query = [
			isClan ? "clan" : "",
			country !== undefined ? `country=${encodeURIComponent(country)}` : ""
		].filter(Boolean);
		const destinationSort = option.dans ? DANS_SORT : referenceSort;
		return `/leaderboard/${option.mode}/${destinationSort}${query.length > 0 ? `?${query.join("&")}` : ""}`;
	};
	
	return (
		<aside ref={wrapperRef} className={classNames(styles.selection_wrapper, styles.compact_mode_selection)}>
			<button type="button"
			        className={styles.leaderboard_mode_trigger}
			        aria-haspopup="menu"
			        aria-expanded={isOpen}
			        onClick={toggleMenu}>
				<ModeIcon mode={baseMode}/>
				<span className={styles.leaderboard_mode_name}>
					<strong>{modeLabel}</strong>
					<small>{playstyleLabel}</small>
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
					{modeGroups.map((group) =>
						<section key={group.mode} className={styles.leaderboard_mode_group}>
							<h2>
								<ModeIcon mode={group.mode}/>
								{group.label}
							</h2>
							<div className={styles.leaderboard_playstyles}>
								{group.options.map((option) => {
									const selected = option.mode === mode && Boolean(option.dans) === (sortBy === DANS_SORT);
									return (
										<Link key={`${option.mode}-${option.label}`}
										      href={getHref(option)}
										      role="menuitem"
										      aria-current={selected ? "page" : undefined}
										      className={classNames({ [styles.selected_playstyle]: selected })}
										      onClick={() => setIsOpen(false)}>
											{option.label}
										</Link>
									);
								})}
							</div>
						</section>
					)}
				</div>}
		</aside>
	);
}
