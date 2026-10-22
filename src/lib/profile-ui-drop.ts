import { getProfileUiDragRows, type ProfileUiContentDrop, type ProfileUiDragLayout } from "@/lib/profile-ui-drag";
import { fitProfileUiAutoRowWidths, getProfileUiMinimumWidths } from "@/lib/profile-ui-width";
import { normalizeProfileUi, type ProfileUiItem } from "@/lib/profile-ui";

export type ProfileUiDropEntry = { content: ProfileUiItem; index: number };

// Project and commit the same layout. Original indices keep the dragged DOM
// node mounted while a separate, translucent card previews its destination.
export const projectProfileUiDrop = (
	contents: ProfileUiItem[],
	layout: ProfileUiDragLayout,
	drop: ProfileUiContentDrop,
	item: ProfileUiItem,
	sourceIndex: number | null,
): ProfileUiDropEntry[] | null => {
	const rows = getProfileUiDragRows(layout.cards).map((row) => row.cards.map((card) => card.index));
	const targetRow = rows.findIndex((row) => row.some((index) => drop.rowIndices.includes(index)));
	const entries = rows.map((row) => row.filter((index) => index !== sourceIndex).map((index) => ({ content: contents[index], index })));
	const ghost = { content: item, index: -1 };
	let horizontalRow: ProfileUiDropEntry[] | null = null;
	if (targetRow === -1) entries.push([ghost]);
	else if (drop.edge === "left" || drop.edge === "right") {
		const row = entries[targetRow];
		const anchor = rows[targetRow].indexOf(drop.rect.index ?? -1);
		const position = anchor < 0 ? row.length : rows[targetRow]
			.slice(0, anchor + (drop.edge === "right" ? 1 : 0)).filter((index) => index !== sourceIndex).length;
		row.splice(position, 0, ghost);
		horizontalRow = row;
	} else entries.splice(targetRow + (drop.edge === "bottom" ? 1 : 0), 0, [ghost]);
	// Returning to the original slot is a cancellation, including the original
	// widths and the special default arrangement. It must not redistribute that row.
	const occupiedRows = entries.filter((row) => row.length > 0);
	if (sourceIndex !== null && occupiedRows.length === rows.length && occupiedRows.every((row, rowIndex) =>
		row.length === rows[rowIndex].length && row.every((entry, index) =>
			(entry.index === -1 ? sourceIndex : entry.index) === rows[rowIndex][index]),
	)) return null;
	const projected = entries.flatMap((row) => {
		const widths = fitProfileUiAutoRowWidths(row.map((entry) => Math.round(entry.content.width * 100)),
			row.map((entry) => entry.content.autoWidth === true), row === horizontalRow,
			layout.fullWidth ? [] : getProfileUiMinimumWidths(row.map((entry) => entry.content), layout.bounds.right - layout.bounds.left));
		return row.map((entry, index) => ({ ...entry, content: { ...entry.content, width: widths[index] / 100 } }));
	});
	const normalized = normalizeProfileUi(projected.map((entry) => entry.content));
	return projected.map((entry, index) => ({ ...entry, content: normalized[index] }));
};

export const commitProfileUiDrop = (entries: ProfileUiDropEntry[]): ProfileUiItem[] =>
	normalizeProfileUi(entries.map((entry) => entry.content));
