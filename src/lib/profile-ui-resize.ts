import type { ProfileUiDragRect } from "@/lib/profile-ui-drag";
import { PROFILE_UI_PREVIEW_HEIGHT_SCALE } from "@/lib/profile-ui-preview-layout";
import { reflowProfileUiWidths } from "@/lib/profile-ui-reflow";

const SNAP_DISTANCE = 8;

export type ProfileUiResizeGeometry = {
	bounds: ProfileUiDragRect;
	neighbors: (ProfileUiDragRect & { index: number; followsRowHeight: boolean })[];
	gridWidth: number;
	horizontalMargin: number;
	columnSpans: number[];
	contentIndex: number;
	fullWidth: boolean;
	reflowWidths?: boolean;
	autoWidths?: boolean[];
	minimumWidths?: number[];
};

const getGridPositions = (spans: number[], contentIndex: number, width: number) => {
	let row = 0;
	let column = 0;
	return spans.map((span, index) => {
		const size = index === contentIndex ? Math.round(width * 100) : span;
		if (column + size > 100) { row += 1; column = 0; }
		const position = { row, column };
		column += size;
		return position;
	});
};

const closest = (value: number, candidates: number[], scale: number, minimum: number, maximum: number) => {
	let result = value;
	let distance = Number.POSITIVE_INFINITY;
	let snapped = false;
	for (const candidate of candidates) {
		if (!Number.isFinite(candidate) || candidate < minimum || candidate > maximum) continue;
		const delta = Math.abs(candidate - value) * scale;
		if (delta > SNAP_DISTANCE || delta >= distance) continue;
		result = candidate;
		distance = delta;
		snapped = true;
	}
	return { value: result, snapped };
};

export const snapProfileUiResize = (
	width: number,
	height: number,
	axis: "width" | "height" | "both",
	geometry: ProfileUiResizeGeometry,
	minimumHeight: number,
	maximumHeight = 2400,
) => {
	const { bounds, gridWidth, horizontalMargin, columnSpans, contentIndex, fullWidth } = geometry;
	const originalPositions = getGridPositions(columnSpans, -1, 0);
	const spansAtWidth = (value: number) => geometry.reflowWidths && !fullWidth
		? reflowProfileUiWidths(columnSpans, contentIndex, value * 100, geometry.autoWidths, geometry.minimumWidths)
		: columnSpans.map((span, index) => index === contentIndex && !fullWidth ? Math.round(value * 100) : span);
	const positionsAtWidth = (value: number) => fullWidth
		? originalPositions
		: getGridPositions(spansAtWidth(value), -1, 0);
	const neighbors = geometry.neighbors.filter((neighbor) => {
		const x = Math.max(0, bounds.left - neighbor.right, neighbor.left - bounds.right);
		const y = Math.max(0, bounds.top - neighbor.bottom, neighbor.top - bounds.bottom);
		return Math.hypot(x, y) <= 32;
	});
	// Snap to visible right edges in other rows. A sibling's left edge moves
	// with this card, and equal dimensions alone do not align either edge.
	const widthTargets = neighbors.flatMap((neighbor) => {
		if (Math.abs(neighbor.top - bounds.top) <= 1) return [];
		const candidate = Math.round((neighbor.right - bounds.left + horizontalMargin) / gridWidth * 100) / 100;
		const positions = positionsAtWidth(candidate);
		if (spansAtWidth(candidate)[neighbor.index] !== columnSpans[neighbor.index]) return [];
		if (positions[contentIndex].column !== originalPositions[contentIndex].column ||
			positions[neighbor.index].column !== originalPositions[neighbor.index].column ||
			positions[contentIndex].row === positions[neighbor.index].row) return [];
		const right = bounds.left + candidate * gridWidth - horizontalMargin;
		// Widths are saved in 1% steps; do not advertise an unreachable edge.
		return Math.abs(right - neighbor.right) <= 1 ? [candidate] : [];
	});
	const snappedWidth = axis === "height"
		? { value: width, snapped: false }
		: closest(width, widthTargets, gridWidth, (geometry.minimumWidths?.[contentIndex] ?? 1) / 100, 1);
	const finalPositions = positionsAtWidth(snappedWidth.value);
	// Bottom edges can align only within the same row. Row-height followers
	// inherit this card's height, so they must never become its snap target.
	const heightTargets = neighbors.filter((neighbor) =>
		!neighbor.followsRowHeight && Math.abs(neighbor.top - bounds.top) <= 1 &&
		finalPositions[contentIndex].row === finalPositions[neighbor.index].row,
	).map((neighbor) => Math.round((neighbor.bottom - bounds.top) / PROFILE_UI_PREVIEW_HEIGHT_SCALE));
	const snappedHeight = axis === "width"
		? { value: height, snapped: false }
		: closest(height, heightTargets, PROFILE_UI_PREVIEW_HEIGHT_SCALE, minimumHeight, maximumHeight);
	return {
		width: Math.round(snappedWidth.value * 100) / 100,
		height: snappedHeight.value,
		snapped: snappedWidth.snapped || snappedHeight.snapped,
		snappedWidth: snappedWidth.snapped,
		snappedHeight: snappedHeight.snapped,
	};
};
