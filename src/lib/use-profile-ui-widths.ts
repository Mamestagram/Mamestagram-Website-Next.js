"use client";

import { useLayoutEffect, useState, type RefObject } from "react";
import { hasDefaultProfileUiArrangement, type ProfileUiItem } from "@/lib/profile-ui";
import { constrainProfileUiWidths, getProfileUiMinimumWidths, resolveProfileUiAutoWidths } from "@/lib/profile-ui-width";

export const useProfileUiGridSize = (rootRef: RefObject<HTMLElement | null>, selector?: string) => {
	const [size, setSize] = useState({ width: 0, viewportWidth: 0 });
	useLayoutEffect(() => {
		const grid = selector ? rootRef.current?.querySelector<HTMLElement>(selector) : rootRef.current;
		if (!grid) return;
		const update = () => {
			const width = grid.clientWidth;
			const viewportWidth = window.innerWidth;
			setSize((previous) => previous.width === width && previous.viewportWidth === viewportWidth
				? previous : { width, viewportWidth });
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(grid);
		window.addEventListener("resize", update);
		return () => { observer.disconnect(); window.removeEventListener("resize", update); };
	}, [rootRef, selector]);
	return size;
};

export const useProfileUiWidths = (gridRef: RefObject<HTMLDivElement | null>, contents: ProfileUiItem[]) => {
	const { width, viewportWidth } = useProfileUiGridSize(gridRef);
	const minimumWidths = getProfileUiMinimumWidths(contents, width);
	const defaultArrangement = hasDefaultProfileUiArrangement(contents);
	const singleColumn = viewportWidth > 0 && (viewportWidth <= 600 || (defaultArrangement && viewportWidth <= 872));
	// The standard layout owns its column ratios and responsive stacking. Minimum
	// widths belong to the free grid and must not turn the standard layout into it.
	const constrained = singleColumn || defaultArrangement ? contents : constrainProfileUiWidths(contents, minimumWidths);
	return {
		gridWidth: width,
		viewportWidth,
		minimumWidths,
		defaultArrangement,
		contents: resolveProfileUiAutoWidths(constrained, singleColumn || defaultArrangement, minimumWidths),
	};
};
