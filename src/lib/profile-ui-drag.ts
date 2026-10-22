import type { ProfileUiContent } from "@/lib/profile-ui";

export type ProfileUiToolboxDrag = { kind: "content"; content: ProfileUiContent };
export type ProfileUiDragRect = { left: number; right: number; top: number; bottom: number };
export type ContentRect = ProfileUiDragRect & { index: number; row?: number };
export type ProfileUiDragLayout = {
	viewport: ProfileUiDragRect;
	scrollLeft: number;
	scrollTop: number;
	bounds: ProfileUiDragRect;
	cards: ContentRect[];
	fullWidth?: boolean;
};
export type ProfileUiToolboxDragSession = ProfileUiToolboxDrag & { layout: ProfileUiDragLayout };
const readRect = (element: HTMLElement): ProfileUiDragRect => {
	const { left, right, top, bottom } = element.getBoundingClientRect();
	return { left, right, top, bottom };
};
export const captureProfileUiDragLayout = (viewport: HTMLElement): ProfileUiDragLayout => ({
	viewport: readRect(viewport),
	scrollLeft: viewport.scrollLeft,
	scrollTop: viewport.scrollTop,
	bounds: readRect(viewport.querySelector<HTMLElement>("[data-profile-ui-grid]") ?? viewport),
	fullWidth: (() => {
		const card = viewport.querySelector<HTMLElement>("[data-preview-content]");
		return card ? getComputedStyle(card).gridColumnEnd === "-1" : false;
	})(),
	cards: Array.from(viewport.querySelectorAll<HTMLElement>("[data-preview-content]")).map((card) => ({
		index: Number(card.dataset.previewContent), ...readRect(card),
		...(card.dataset.profileUiLayoutRow !== undefined ? { row: Number(card.dataset.profileUiLayoutRow) } : {}),
	})),
});

export const getProfileUiDragPoint = (layout: ProfileUiDragLayout, viewport: HTMLElement, x: number, y: number) => {
	const rect = viewport.getBoundingClientRect();
	if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return null;
	return {
		x: x - rect.left + layout.viewport.left + viewport.scrollLeft - layout.scrollLeft,
		y: y - rect.top + layout.viewport.top + viewport.scrollTop - layout.scrollTop,
	};
};

export type ProfileUiContentDrop = {
	insertionIndex: number;
	edge: "top" | "bottom" | "left" | "right";
	rect: ProfileUiDragRect & { index?: number };
	rowIndices: number[];
};

export const getProfileUiDragRows = (cards: ContentRect[]) => {
	// Compacted columns can put a later card above an earlier one. Retain the
	// logical row membership so moving a card never reorders unrelated cards.
	if (cards.length > 0 && cards.every((card) => card.row !== undefined)) {
		const grouped = new Map<number, ContentRect[]>();
		for (const card of cards) {
			const row = card.row ?? 0;
			const members = grouped.get(row) ?? [];
			members.push(card);
			grouped.set(row, members);
		}
		return [...grouped.entries()].sort(([left], [right]) => left - right).map(([, members]) => ({
			top: Math.min(...members.map((card) => card.top)),
			bottom: Math.max(...members.map((card) => card.bottom)),
			cards: members.sort((left, right) => left.left - right.left),
		}));
	}
	const orderedCards = [...cards].sort((left, right) => left.top - right.top || left.left - right.left);
	const rows: { top: number; bottom: number; cards: ContentRect[] }[] = [];
	for (const card of orderedCards) {
		const row = rows[rows.length - 1];
		if (row && Math.abs(row.top - card.top) <= 1) {
			row.cards.push(card);
			row.bottom = Math.max(row.bottom, card.bottom);
		} else rows.push({ top: card.top, bottom: card.bottom, cards: [card] });
	}
	return rows;
};

const DROP_EDGE_DISTANCE = 30;
const DROP_GAP_DISTANCE = 50;

export const getProfileUiContentDrop = (
	cards: ContentRect[],
	bounds: ProfileUiDragRect,
	direction: "horizontal" | "vertical",
	x: number,
	y: number,
	options?: { sourceIndex: number | null; canFillRow?: (indices: number[]) => boolean },
): ProfileUiContentDrop | null => {
	if (cards.length === 0) return { insertionIndex: 0, edge: "top", rect: bounds, rowIndices: [] };
	const closest: { distance: number; target: ProfileUiContentDrop | null } = { distance: Number.POSITIVE_INFINITY, target: null };
	let vacantTarget: ProfileUiContentDrop | null = null;
	const offer = (distance: number, maximum: number, target: ProfileUiContentDrop) => {
		if (distance > maximum || distance >= closest.distance) return;
		closest.distance = distance;
		closest.target = target;
	};
	const rows = direction === "vertical"
		? cards.map((card) => ({ top: card.top, bottom: card.bottom, cards: [card] }))
		: getProfileUiDragRows(cards);
	const overContent = options?.canFillRow && cards.some((card) => card.index !== options.sourceIndex &&
		x >= card.left && x <= card.right && y >= card.top && y <= card.bottom);
	for (const row of rows) {
		const first = row.cards[0];
		const last = row.cards[row.cards.length - 1];
		const rowIndices = row.cards.map((card) => card.index);
		const heightBand = Math.min(DROP_EDGE_DISTANCE, (row.bottom - row.top) * 0.2);
		if (direction === "horizontal" && first.row !== undefined) {
			for (const card of row.cards) {
				if (x < card.left - DROP_EDGE_DISTANCE || x > card.right + DROP_EDGE_DISTANCE) continue;
				const band = Math.min(DROP_EDGE_DISTANCE, (card.bottom - card.top) * 0.2);
				offer(Math.abs(y - card.top), y >= card.top ? band : DROP_EDGE_DISTANCE,
					{ insertionIndex: first.index, edge: "top", rect: card, rowIndices });
				offer(Math.abs(y - card.bottom), y <= card.bottom ? band : DROP_EDGE_DISTANCE,
					{ insertionIndex: last.index + 1, edge: "bottom", rect: card, rowIndices });
			}
		} else if (x >= first.left - DROP_EDGE_DISTANCE && x <= last.right + DROP_EDGE_DISTANCE) {
			offer(Math.abs(y - row.top), y >= row.top ? heightBand : DROP_EDGE_DISTANCE,
				{ insertionIndex: first.index, edge: "top", rect: first, rowIndices });
			offer(Math.abs(y - row.bottom), y <= row.bottom ? heightBand : DROP_EDGE_DISTANCE,
				{ insertionIndex: last.index + 1, edge: "bottom", rect: last, rowIndices });
		}
		if (direction === "vertical") continue;
		for (const [index, card] of row.cards.entries()) {
			if (y < card.top || y > card.bottom) continue;
			const widthBand = Math.min(DROP_EDGE_DISTANCE, (card.right - card.left) * 0.2);
			if (index === 0) offer(Math.abs(x - card.left), x >= card.left ? widthBand : DROP_EDGE_DISTANCE,
				{ insertionIndex: card.index, edge: "left", rect: card, rowIndices });
			if (index === row.cards.length - 1) offer(Math.abs(x - card.right), x <= card.right ? widthBand : DROP_EDGE_DISTANCE,
				{ insertionIndex: card.index + 1, edge: "right", rect: card, rowIndices });
			const previous = row.cards[index - 1];
			if (!previous || y < previous.top || y > previous.bottom) continue;
			// Widen both sides of an internal gap without reaching card centers
			// or accidentally selecting a boundary beyond a narrow neighbor.
			const leftBand = Math.min(DROP_GAP_DISTANCE, (previous.right - previous.left) * 0.4);
			const rightBand = Math.min(DROP_GAP_DISTANCE, (card.right - card.left) * 0.4);
			if (x >= previous.right - leftBand && x <= card.left + rightBand)
				offer(Math.max(previous.right - x, x - card.left, 0), DROP_GAP_DISTANCE,
					{ insertionIndex: card.index, edge: "left", rect: card, rowIndices });
		}
		// An Auto card can shrink into the vacant end of a row. Make the whole
		// available space a target, rather than only the last card's 30px edge.
		if (!overContent && options?.canFillRow && x > last.right && x <= bounds.right &&
			y >= row.top && y <= row.bottom && options.canFillRow(rowIndices))
			vacantTarget ??= { insertionIndex: last.index + 1, edge: "right", rect: last, rowIndices };
	}
	return closest.target ?? vacantTarget;
};
