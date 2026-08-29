"use client";

import classNames from "classnames";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { OsuMode, type VnMode } from "@/lib/mode";
import FontAwesome from "@/components/font-awesome";
import ModeIcon from "@/components/mode-icon";
import SetMainModeButton from "@/components/profile/set-main-mode-button";
import styles from "@s/profile.module.css";

type ModeOption = {
	label: string;
	mode: OsuMode;
	icon: string;
	dans?: boolean;
};

type ModeGroup = {
	label: string;
	mode: VnMode;
	options: ModeOption[];
};

const modeGroups: ModeGroup[] = [
	{
		label: "STD",
		mode: OsuMode.std,
		options: [
			{ label: "Vanilla", mode: OsuMode.std, icon: "circle-dot" },
			{ label: "Relax", mode: OsuMode.rxstd, icon: "leaf" },
			{ label: "Auto Pilot", mode: OsuMode.apstd, icon: "location-arrow" },
			{ label: "Dans", mode: OsuMode.std, icon: "medal", dans: true },
		],
	},
	{
		label: "Taiko",
		mode: OsuMode.taiko,
		options: [
			{ label: "Vanilla", mode: OsuMode.taiko, icon: "circle-dot" },
			{ label: "Relax", mode: OsuMode.rxtaiko, icon: "leaf" },
			{ label: "Dans", mode: OsuMode.taiko, icon: "medal", dans: true },
		],
	},
	{
		label: "Catch",
		mode: OsuMode.ctb,
		options: [
			{ label: "Vanilla", mode: OsuMode.ctb, icon: "circle-dot" },
			{ label: "Relax", mode: OsuMode.rxctb, icon: "leaf" },
			{ label: "Dans", mode: OsuMode.ctb, icon: "medal", dans: true },
		],
	},
	{
		label: "Mania",
		mode: OsuMode.mania,
		options: [
			{ label: "Vanilla", mode: OsuMode.mania, icon: "circle-dot" },
			{ label: "Dans", mode: OsuMode.mania, icon: "medal", dans: true },
		],
	},
];

function getBaseMode(mode: OsuMode): VnMode {
	if ([OsuMode.std, OsuMode.rxstd, OsuMode.apstd].includes(mode))
		return OsuMode.std;
	if ([OsuMode.taiko, OsuMode.rxtaiko].includes(mode)) return OsuMode.taiko;
	if ([OsuMode.ctb, OsuMode.rxctb].includes(mode)) return OsuMode.ctb;
	return OsuMode.mania;
}

function getOptionLabel(mode: OsuMode, isDans: boolean) {
	if (isDans) return "Dans";
	if ([OsuMode.rxstd, OsuMode.rxtaiko, OsuMode.rxctb].includes(mode))
		return "Relax";
	if (mode === OsuMode.apstd) return "Auto Pilot";
	return "Vanilla";
}

export default function ProfileModeSelection({
	id,
	mode,
	isClan,
	isDans,
	mainMode,
	canSetMainMode,
}: {
	id: number;
	mode: OsuMode;
	isClan: boolean;
	isDans: boolean;
	mainMode: VnMode;
	canSetMainMode: boolean;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [isMenuMounted, setIsMenuMounted] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const baseMode = getBaseMode(mode);
	const optionLabel = getOptionLabel(mode, isDans);
	const activeGroup =
		modeGroups.find((group) => group.mode === baseMode) ?? modeGroups[0];
	const activeOption =
		activeGroup.options.find(
			(option) => option.mode === mode && Boolean(option.dans) === isDans,
		) ?? activeGroup.options[0];
	
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
		const queries = [isClan ? "clan" : "", option.dans ? "dans" : ""].filter(
			Boolean,
		);
		return `/profile/${id}/${option.mode}${queries.length > 0 ? `?${queries.join("&")}` : ""}`;
	};
	const getGameModeHref = (group: ModeGroup) => {
		const option =
			group.options.find(({ label }) => label === optionLabel) ??
			group.options[0];
		return getHref(option);
	};
	
	return (
		<div ref={wrapperRef} className={styles.profile_mode_selection}>
			<div
				className={styles.profile_playstyle_selection}
				data-playstyle={optionLabel}
			>
				<button
					type="button"
					className={styles.profile_mode_trigger}
					aria-label={`Select playstyle. Current: ${optionLabel}`}
					aria-haspopup="menu"
					aria-expanded={isOpen}
					onClick={toggleMenu}
				>
					<FontAwesome prefix="fad" name={activeOption.icon}/>
					<span className={styles.profile_mode_name}>
            <strong>{optionLabel}</strong>
          </span>
					<FontAwesome
						className={styles.profile_mode_chevron}
						prefix="fas"
						name="chevron-right"
					/>
				</button>
				
				{isMenuMounted && (
					<div
						className={styles.profile_mode_menu}
						role="menu"
						data-state={isOpen ? "open" : "closed"}
						onAnimationEnd={(event) => {
							if (event.target === event.currentTarget && !isOpen)
								setIsMenuMounted(false);
						}}
					>
						<div className={styles.profile_playstyles}>
							{activeGroup.options.map((option) => {
								const selected =
									option.mode === mode && Boolean(option.dans) === isDans;
								return (
									<Link
										key={`${option.mode}-${option.label}`}
										href={getHref(option)}
										role="menuitem"
										aria-current={selected ? "page" : undefined}
										className={classNames({
											[styles.selected_playstyle]: selected,
										})}
										onClick={() => setIsOpen(false)}
									>
										<FontAwesome prefix="fad" name={option.icon}/>
										{option.label}
									</Link>
								);
							})}
						</div>
					</div>
				)}
			</div>
			
			<div className={styles.profile_mode_options}>
				{canSetMainMode && (
					<SetMainModeButton profileId={id} mode={mode} isClan={isClan}/>
				)}
				<nav className={styles.profile_game_modes} aria-label="Game mode">
					{modeGroups.map((group) => (
						<Link
							key={group.mode}
							href={getGameModeHref(group)}
							aria-label={`${group.label}${group.mode === mainMode ? " (main mode)" : ""}`}
							title={`${group.label}${group.mode === mainMode ? " · Main mode" : ""}`}
							aria-current={group.mode === baseMode ? "page" : undefined}
							className={classNames({
								[styles.selected_game_mode]: group.mode === baseMode,
							})}
						>
							<ModeIcon mode={group.mode}/>
							{group.mode === mainMode && (
								<FontAwesome
									className={styles.profile_main_mode_star}
									prefix="fas"
									name="star"
								/>
							)}
						</Link>
					))}
				</nav>
			</div>
		</div>
	);
}
