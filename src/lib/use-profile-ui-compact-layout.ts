"use client";

import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";

// Keep the normal grid's widths and Auto-height matching, then remove vertical
// space below shorter cards. Variable-height tracks avoid a pixel-sized grid
// with millions of implicit rows in long profiles.
export const useProfileUiCompactLayout = (gridRef: RefObject<HTMLDivElement | null>) => {
	const managed = useRef(new Set<HTMLElement>());
	const update = useCallback(() => {
		const grid = gridRef.current;
		if (!grid) return;
		grid.style.removeProperty("grid-template-rows");
		grid.style.removeProperty("row-gap");
		for (const card of managed.current) {
			card.style.removeProperty("grid-column-start");
			card.style.removeProperty("grid-column-end");
			card.style.removeProperty("grid-row-start");
			card.style.removeProperty("grid-row-end");
			delete card.dataset.profileUiLayoutRow;
		}
		managed.current.clear();
		if (grid.dataset.profileUiDefault === "true") return;
		const cards = Array.from(grid.children).filter((element): element is HTMLElement =>
			element instanceof HTMLElement && element.hasAttribute("data-content") && element.dataset.moveSource !== "true",
		).sort((left, right) => Number(left.style.order) - Number(right.style.order));
		// The responsive single-column layout already has no empty vertical space.
		if (cards.length === 0 || getComputedStyle(cards[0]).gridColumnEnd === "-1") return;
		const gap = Number.parseFloat(getComputedStyle(grid).rowGap) || 0;
		const bottoms = Array<number>(100).fill(0);
		let column = 0;
		let row = 0;
		const placements = cards.map((card) => {
			const style = getComputedStyle(card);
			const spanValue = [style.gridColumnStart, style.gridColumnEnd].find((value) => value.startsWith("span "));
			const span = Math.max(1, Math.min(100, Number.parseInt(spanValue?.slice(5) ?? "100", 10) || 100));
			if (column + span > 100) { column = 0; row += 1; }
			const start = column;
			column += span;
			// Measure the ordinary grid before changing its tracks, so Auto cards
			// still match the tallest member of their original horizontal row.
			const height = card.getBoundingClientRect().height;
			const top = Math.max(...bottoms.slice(start, start + span));
			const bottom = top + height;
			bottoms.fill(bottom + gap, start, start + span);
			return { card, start, span, top, bottom, row };
		});
		const edges = [...new Set(placements.flatMap(({ top, bottom }) => [top, bottom]))].sort((left, right) => left - right);
		const lines = new Map(edges.map((edge, index) => [edge, index + 1]));
		grid.style.rowGap = "0px";
		grid.style.gridTemplateRows = edges.slice(1).map((edge, index) => `${edge - edges[index]}px`).join(" ");
		for (const { card, start, span, top, bottom, row } of placements) {
			card.style.gridColumnStart = String(start + 1);
			card.style.gridColumnEnd = String(start + span + 1);
			card.style.gridRowStart = String(lines.get(top));
			card.style.gridRowEnd = String(lines.get(bottom));
			card.dataset.profileUiLayoutRow = String(row);
			managed.current.add(card);
		}
	}, [gridRef]);

	useLayoutEffect(() => { update(); });
	useLayoutEffect(() => {
		const grid = gridRef.current;
		if (!grid) return;
		let frame: number | null = null;
		const observed = new Set<Element>();
		const schedule = () => {
			if (frame !== null) return;
			frame = requestAnimationFrame(() => { frame = null; observe(); update(); });
		};
		const observer = new ResizeObserver(schedule);
		const observe = () => {
			const elements = new Set<Element>([grid, ...grid.querySelectorAll(":scope > [data-content], :scope > [data-content] > *")]);
			for (const element of observed) if (!elements.has(element)) { observer.unobserve(element); observed.delete(element); }
			for (const element of elements) if (!observed.has(element)) { observer.observe(element); observed.add(element); }
		};
		const mutations = new MutationObserver(schedule);
		mutations.observe(grid, { childList: true, subtree: true, characterData: true });
		observe();
		grid.addEventListener("load", schedule, true);
		grid.addEventListener("toggle", schedule, true);
		document.fonts.addEventListener("loadingdone", schedule);
		return () => {
			if (frame !== null) cancelAnimationFrame(frame);
			observer.disconnect(); mutations.disconnect();
			grid.removeEventListener("load", schedule, true);
			grid.removeEventListener("toggle", schedule, true);
			document.fonts.removeEventListener("loadingdone", schedule);
		};
	}, [gridRef, update]);
};
