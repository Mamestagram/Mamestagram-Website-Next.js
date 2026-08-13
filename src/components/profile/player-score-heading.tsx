"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { createPortal } from "react-dom";
import styles from "@s/profile.module.css";

type TooltipState = {
	text: string,
	anchorX: number,
	left: number,
	top: number,
	side: "above" | "below"
};

export default function PlayerScoreHeading({ artist, title }: {
	artist: string,
	title: string
}) {
	const tooltipRef = useRef<HTMLSpanElement>(null);
	const [tooltip, setTooltip] = useState<TooltipState | null>(null);

	const showTooltip = (element: HTMLElement, text: string) => {
		const bounds = element.getBoundingClientRect();
		const anchorX = bounds.left + bounds.width / 2;
		const side = bounds.bottom < window.innerHeight * .72 ? "below" : "above";
		setTooltip({
			text,
			anchorX,
			left: anchorX,
			top: side === "below" ? bounds.bottom + 10 : bounds.top - 10,
			side
		});
	};

	const showPointerTooltip = (event: PointerEvent<HTMLSpanElement>, text: string) => {
		showTooltip(event.currentTarget, text);
	};

	useLayoutEffect(() => {
		const element = tooltipRef.current;
		if (!element || !tooltip) return;
		const bounds = element.getBoundingClientRect();
		const pagePadding = 12;
		let shift = 0;
		if (bounds.left < pagePadding) shift = pagePadding - bounds.left;
		else if (bounds.right > window.innerWidth - pagePadding) {
			shift = window.innerWidth - pagePadding - bounds.right;
		}
		if (shift !== 0) setTooltip((current) => current ? { ...current, left: current.left + shift } : null);
	}, [tooltip]);

	return (
		<>
			<h2 className={styles.map_heading}>
				<span className={styles.artist}
				      onPointerEnter={(event) => showPointerTooltip(event, artist)}
				      onPointerLeave={() => setTooltip(null)}>
					{artist}
				</span>
				<span className={styles.heading_separator}>—</span>
				<span className={styles.title}
				      onPointerEnter={(event) => showPointerTooltip(event, title)}
				      onPointerLeave={() => setTooltip(null)}>
					{title}
				</span>
			</h2>
			{tooltip && createPortal(
				<span ref={tooltipRef}
				      className={styles.score_text_tooltip}
				      data-side={tooltip.side}
				      role="tooltip"
				      style={{
					      "--score-tooltip-arrow-offset": `${tooltip.anchorX - tooltip.left}px`,
					      left: tooltip.left,
					      top: tooltip.top
				      } as CSSProperties}>
					{tooltip.text}
				</span>,
				document.body
			)}
		</>
	);
}
