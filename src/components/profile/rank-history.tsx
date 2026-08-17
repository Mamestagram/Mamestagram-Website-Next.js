"use client";

import type { RankHistory } from "@/database/rank-history";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/profile.module.css";
import { useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";

const CHART_WIDTH = 640;
const CHART_HEIGHT = 142;
const CHART_PADDING = 9;

const formatRank = (rank: number) => `#${rank.toLocaleString("en-US")}`;
const formatDate = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
	month: "short",
	day: "numeric",
	timeZone: "UTC"
});

export default function RankHistoryChart({ history }: { history: RankHistory }) {
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	if (!history.hasData || history.points.length === 0) {
		return (
			<section className={styles.rank_history}>
				<div className={styles.rank_history_header}>
					<span className={styles.rank_history_title}>
						<FontAwesome prefix="fad" name="chart-line"/>
						<span><strong>Ranking Trend</strong><small>Last 90 days</small></span>
					</span>
				</div>
				<div className={styles.rank_history_empty}>
					<FontAwesome prefix="fad" name="signal-bars-slash"/>
					<span><strong>No ranking history yet</strong><small>Daily snapshots will appear here.</small></span>
				</div>
			</section>
		);
	}

	const ranks = history.points.map(({ rank }) => rank);
	const bestRank = Math.min(...ranks);
	const currentRank = ranks.at(-1)!;
	const change = ranks[0] - currentRank;
	const minRank = bestRank;
	const maxRank = Math.max(...ranks);
	const rankRange = maxRank - minRank;
	const coordinates = history.points.map(({ date, rank }, index) => {
		const x = history.points.length === 1
			? CHART_WIDTH / 2
			: CHART_PADDING + index / (history.points.length - 1) * (CHART_WIDTH - CHART_PADDING * 2);
		const y = rankRange === 0
			? CHART_HEIGHT / 2
			: CHART_PADDING + (rank - minRank) / rankRange * (CHART_HEIGHT - CHART_PADDING * 2);
		return { date, rank, x, y };
	});
	const firstPoint = coordinates.at(0)!;
	const lastPoint = coordinates.at(-1)!;
	const linePath = coordinates.map(({ x, y }, index) =>
		`${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`
	).join(" ");
	const areaPath = `${linePath} L${lastPoint.x} ${CHART_HEIGHT} L${firstPoint.x} ${CHART_HEIGHT} Z`;
	const middlePoint = history.points[Math.floor((history.points.length - 1) / 2)];
	const changeDirection = change > 0 ? "up" : change < 0 ? "down" : "same";
	const activePoint = activeIndex === null ? null : coordinates[activeIndex];
	const activateClosestPoint = (event: PointerEvent<HTMLDivElement>) => {
		const bounds = event.currentTarget.getBoundingClientRect();
		const ratio = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
		setActiveIndex(Math.round(ratio * (coordinates.length - 1)));
	};
	const handleChartKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
		event.preventDefault();
		const direction = event.key === "ArrowRight" ? 1 : -1;
		setActiveIndex((current) => Math.min(
			coordinates.length - 1,
			Math.max(0, (current ?? coordinates.length - 1) + direction)
		));
	};

	return (
		<section className={styles.rank_history}>
			<div className={styles.rank_history_header}>
				<span className={styles.rank_history_title}>
					<FontAwesome prefix="fad" name="chart-line"/>
					<span><strong>Ranking Trend</strong><small>Last 90 days</small></span>
				</span>
				<ul className={styles.rank_history_stats}>
					<li><small>Current</small><strong>{formatRank(currentRank)}</strong></li>
					<li><small>Best</small><strong>{formatRank(bestRank)}</strong></li>
					<li className={styles.rank_change} data-direction={changeDirection}>
						<small>90d change</small>
						<strong>{change > 0 ? "↑" : change < 0 ? "↓" : "—"}{change !== 0 && Math.abs(change).toLocaleString("en-US")}</strong>
					</li>
				</ul>
			</div>

			<div className={styles.rank_chart}
			     tabIndex={0}
			     onPointerDown={activateClosestPoint}
			     onPointerMove={(event) => {
				     if (event.pointerType !== "touch") activateClosestPoint(event);
			     }}
			     onPointerLeave={(event) => {
				     if (event.pointerType !== "touch") setActiveIndex(null);
			     }}
			     onKeyDown={handleChartKeyDown}
			     aria-label="Ranking history chart. Hover, tap, or use the left and right arrow keys to inspect a rank.">
				<svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
				     preserveAspectRatio="none"
				     aria-hidden="true">
					<defs>
						<linearGradient id="rank-history-area" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="hsl(var(--user-hue), 70%, 62%)" stopOpacity=".34"/>
							<stop offset="100%" stopColor="hsl(var(--user-hue), 70%, 42%)" stopOpacity="0"/>
						</linearGradient>
					</defs>
					{[.25, .5, .75].map((position) =>
						<line key={position}
						      className={styles.rank_grid_line}
						      x1="0" y1={CHART_HEIGHT * position}
						      x2={CHART_WIDTH} y2={CHART_HEIGHT * position}/>)}
					<path className={styles.rank_chart_area} d={areaPath}/>
					<path className={styles.rank_chart_line} d={linePath}/>
					{activePoint && <>
						<line className={styles.rank_chart_cursor}
						      x1={activePoint.x} y1="0"
						      x2={activePoint.x} y2={CHART_HEIGHT}/>
						<circle className={styles.rank_chart_active_point}
						        cx={activePoint.x} cy={activePoint.y} r="5"/>
					</>}
				</svg>
				{activePoint && <span
					className={styles.rank_chart_tooltip}
					data-align={activePoint.x < CHART_WIDTH * .12 ? "start" : activePoint.x > CHART_WIDTH * .88 ? "end" : "center"}
					data-side={activePoint.y < CHART_HEIGHT * .42 ? "below" : "above"}
					style={{
						"--rank-point-x": `${activePoint.x / CHART_WIDTH * 100}%`,
						"--rank-point-y": `${activePoint.y / CHART_HEIGHT * 100}%`
					} as CSSProperties}>
					<small>{formatDate(activePoint.date)}</small>
					<strong>{formatRank(activePoint.rank)}</strong>
				</span>}
			</div>

			<div className={styles.rank_chart_axis} aria-hidden="true">
				<span>{formatDate(history.points[0].date)}</span>
				<span>{formatDate(middlePoint.date)}</span>
				<span>{formatDate(lastPoint.date)}</span>
			</div>
		</section>
	);
}
