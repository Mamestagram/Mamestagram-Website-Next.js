import type { ProfileUiContent, ProfileUiItem } from "@/lib/profile-ui";

// Card widths exclude the space between neighboring cards. Horizontal size is
// not halved in the editor, so these limits also protect the actual profile.
export const profileUiMinWidths: Record<ProfileUiContent, number> = {
	info: 640,
	stats: 280,
	me: 240,
	bestpp: 360,
	first_place: 360,
	most_played: 320,
	recent_played: 360,
	achievements: 260,
	custom_achievements: 260,
};

export const getProfileUiMinimumWidths = (contents: Pick<ProfileUiItem, "content">[], gridWidth: number, gap = 16): number[] =>
	contents.map(({ content }) => gridWidth > 0 ? Math.min(100, Math.ceil((profileUiMinWidths[content] + gap) / gridWidth * 100)) : 1);

export const constrainProfileUiWidths = (contents: ProfileUiItem[], minimumWidths: number[]): ProfileUiItem[] => {
	const constrained = contents.map((content, index) => Math.round(content.width * 100) < minimumWidths[index]
		? { ...content, width: minimumWidths[index] / 100 } : content);
	let row: number[] = [];
	let used = 0;
	const finish = () => {
		const allAuto = row.length > 0 && row.every((index) => contents[index].autoWidth);
		const required = row.reduce((sum, index) => sum + (contents[index].autoWidth
			? minimumWidths[index] ?? 1 : Math.round(constrained[index].width * 100)), 0);
		// Keep the saved row together when Auto neighbors can absorb a larger
		// minimum, before the ordinary width resolver decides where to wrap.
		if (allAuto || (required <= 100 && row.some((index) => constrained[index] !== contents[index]))) {
			const widths = fitProfileUiAutoRowWidths(row.map((index) => Math.round(contents[index].width * 100)),
				row.map((index) => contents[index].autoWidth === true), allAuto,
				row.map((index) => minimumWidths[index] ?? 1));
			row.forEach((index, offset) => {
				constrained[index] = widths[offset] === Math.round(contents[index].width * 100)
					? contents[index] : { ...contents[index], width: widths[offset] / 100 };
			});
		}
		row = [];
		used = 0;
	};
	for (const [index, content] of contents.entries()) {
		const span = Math.round(content.width * 100);
		if (used + span > 100) finish();
		row.push(index);
		used += span;
		if (used === 100) finish();
	}
	finish();
	return constrained;
};

export const distributeProfileUiWidths = (members: number[], budget: number, weights: number[], result: number[], minimumWidths: number[] = []) => {
	if (members.length === 0) return;
	let pending = [...members];
	let available = budget;
	while (pending.length > 0) {
		const totalWeight = pending.reduce((sum, index) => sum + weights[index], 0);
		const constrained = pending.filter((index) => available * weights[index] / totalWeight < (minimumWidths[index] ?? 1));
		if (constrained.length === 0) break;
		for (const index of constrained) { result[index] = minimumWidths[index] ?? 1; available -= result[index]; }
		const fixed = new Set(constrained);
		pending = pending.filter((index) => !fixed.has(index));
	}
	const totalWeight = pending.reduce((sum, index) => sum + weights[index], 0);
	const shares = pending.map((index) => ({ index, value: available * weights[index] / totalWeight }));
	for (const share of shares) result[share.index] = Math.floor(share.value);
	const remainder = budget - members.reduce((sum, index) => sum + result[index], 0);
	shares.sort((left, right) => (right.value % 1) - (left.value % 1) || left.index - right.index);
	for (let index = 0; index < remainder; index += 1) result[shares[index].index] += 1;
};

// Keep manual widths intact. If a row cannot fit, wrap in content order and
// distribute only the remaining width among that row's Auto cards.
export const fitProfileUiAutoRowWidths = (spans: number[], autoWidths: boolean[], equalizeAuto = false, minimumWidths: number[] = []): number[] => {
	spans = spans.map((span, index) => Math.max(span, minimumWidths[index] ?? 1));
	const result = [...spans];
	const weights = equalizeAuto ? spans.map(() => 1) : spans;
	let row: number[] = [];
	let used = 0;
	const finish = () => {
		const autos = row.filter((index) => autoWidths[index]);
		const fixed = row.filter((index) => !autoWidths[index]).reduce((sum, index) => sum + spans[index], 0);
		if (autos.length > 0 && (equalizeAuto || autos.reduce((sum, index) => sum + spans[index], 0) !== 100 - fixed))
			distributeProfileUiWidths(autos, 100 - fixed, weights, result, minimumWidths);
		row = [];
		used = 0;
	};
	for (const [index, span] of spans.entries()) {
		const minimum = autoWidths[index] ? minimumWidths[index] ?? 1 : span;
		// Only wrap when the minimum widths cannot fit. The distributor fixes
		// undersized shares at their minimum and divides the remaining budget again.
		if (used + minimum > 100) finish();
		row.push(index);
		used += minimum;
	}
	finish();
	return result;
};

// Saved widths establish row membership. All-Auto rows share space equally;
// mixed rows retain manual widths and the relative weights of their Auto cards.
const resolveProfileUiAutoWidthRows = (contents: ProfileUiItem[], minimumWidths: number[]): ProfileUiItem[] => {
	const spans = contents.map((content) => Math.round(content.width * 100));
	const result = [...spans];
	let row: number[] = [];
	let used = 0;
	const finish = () => {
		const autos = row.filter((index) => contents[index].autoWidth);
		const fixed = row.filter((index) => !contents[index].autoWidth).reduce((sum, index) => sum + spans[index], 0);
		const budget = 100 - fixed;
		// Viewport minimums are needed to recompute equal shares. Without them,
		// preserve the allocated widths so saving does not undo minimum constraints.
		if (minimumWidths.length > 0 && row.length > 0 && autos.length === row.length) {
			const widths = fitProfileUiAutoRowWidths(row.map((index) => spans[index]),
				row.map(() => true), true, row.map((index) => minimumWidths[index] ?? 1));
			row.forEach((index, offset) => { result[index] = widths[offset]; });
		} else if (autos.reduce((sum, index) => sum + spans[index], 0) !== budget)
			distributeProfileUiWidths(autos, budget, spans, result, minimumWidths);
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
	return contents.map((content, index) => result[index] === spans[index] ? content : { ...content, width: result[index] / 100 });
};

export const resolveProfileUiAutoWidths = (contents: ProfileUiItem[], defaultArrangement = false, minimumWidths: number[] = []): ProfileUiItem[] => {
	if (defaultArrangement || !contents.some((content) => content.autoWidth)) return contents;
	let resolved = contents;
	// A newly equalized row can move beside a preceding partial manual row.
	// Settle those row boundaries before rendering or saving the result.
	for (let pass = 0; pass <= contents.length; pass += 1) {
		const next = resolveProfileUiAutoWidthRows(resolved, minimumWidths);
		if (next.every((content, index) => content.width === resolved[index].width)) return resolved;
		resolved = next;
	}
	return resolved;
};
