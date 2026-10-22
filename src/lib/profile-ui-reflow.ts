import { normalizeProfileUi, type ProfileUiItem } from "@/lib/profile-ui";
import { fitProfileUiAutoRowWidths } from "@/lib/profile-ui-width";

// Resize the selected card without changing any manual neighbor's width.
// Existing rows supply the Auto cards that may absorb the changed space.
export const reflowProfileUiWidths = (spans: number[], contentIndex: number, width: number, autoWidths: boolean[] = [], minimumWidths: number[] = []): number[] => {
	spans = spans.map((span, index) => Math.max(span, minimumWidths[index] ?? 1));
	const result = [...spans];
	if (contentIndex < 0 || contentIndex >= spans.length) return result;
	result[contentIndex] = Math.max(minimumWidths[contentIndex] ?? 1, Math.min(100, Math.round(width)));
	const automatic = spans.map((_, index) => index !== contentIndex && autoWidths[index] === true);
	let row: number[] = [];
	let used = 0;
	const finish = () => {
		const sizes = fitProfileUiAutoRowWidths(row.map((index) => result[index]), row.map((index) => automatic[index]), false, row.map((index) => minimumWidths[index] ?? 1));
		row.forEach((index, offset) => { result[index] = sizes[offset]; });
		row = [];
		used = 0;
	};
	for (const [index, span] of spans.entries()) {
		if (used + span > 100) finish();
		row.push(index);
		used += span;
		if (used === 100) finish();
	}
	finish();
	return result;
};

export const updateProfileUiContent = (
	contents: ProfileUiItem[],
	contentIndex: number,
	change: Partial<ProfileUiItem>,
	baseline = contents,
	minimumWidths: number[] = [],
): ProfileUiItem[] => {
	const widthChanged = change.width !== undefined && change.width !== contents[contentIndex]?.width;
	const next = contents.map((item, index) => index === contentIndex ? {
		...item, ...change,
		...(widthChanged && change.autoWidth === undefined ? { autoWidth: false } : {}),
	} : item);
	if (!contents[contentIndex] || !widthChanged) return normalizeProfileUi(next);
	const source = baseline.length === contents.length && baseline.every((item, index) => item.content === contents[index].content)
		? baseline : contents;
	const spans = reflowProfileUiWidths(source.map((item) => Math.round(item.width * 100)), contentIndex, (change.width ?? contents[contentIndex].width) * 100, next.map((item) => item.autoWidth === true), minimumWidths);
	return normalizeProfileUi(next.map((item, index) => ({ ...item, width: spans[index] / 100 })));
};
