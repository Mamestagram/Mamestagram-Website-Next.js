"use client";

import { Fragment, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import FontAwesome from "@/components/font-awesome";
import CustomAchievementSlots from "@/components/profile/custom-achievement-slots";
import type { CustomAchievementSelection } from "@/lib/custom-achievements";
import ProfileUiAchievementsPreview from "@/components/settings/profile-ui-achievements-preview";
import ProfileUiMePreview from "@/components/settings/profile-ui-me-preview";
import ProfileUiScorePreview from "@/components/settings/profile-ui-score-preview";
import {
	getProfileUiContentMinHeight,
	getProfileUiContentHeightLimits,
	getProfileUiRowHeightMatches,
	isProfileUiRowHeight,
	isProfileUiAutoHeight,
	createProfileUiToolboxContent,
	PROFILE_UI_MAX_CONTENTS,
	hexToHsl,
	PROFILE_UI_SCORE_AUTO_HEIGHT,
	profileUiContentLabels,
	normalizeProfileUi,
	type ProfileUiItem,
	type ProfileUiContent,
} from "@/lib/profile-ui";
import { getWebThemeName, type WebTheme } from "@/lib/theme";
import { getProfileUiScoreLayoutStyle } from "@/lib/profile-ui-score-layout";
import { PROFILE_UI_PREVIEW_HEIGHT_SCALE } from "@/lib/profile-ui-preview-layout";
import { snapProfileUiResize, type ProfileUiResizeGeometry } from "@/lib/profile-ui-resize";
import { projectProfileUiDrop, commitProfileUiDrop } from "@/lib/profile-ui-drop";
import { useProfileUiDragMotion } from "@/lib/use-profile-ui-drag-motion";
import { useProfileUiCompactLayout } from "@/lib/use-profile-ui-compact-layout";
import { useProfileUiWidths } from "@/lib/use-profile-ui-widths";
import { fitProfileUiAutoRowWidths, getProfileUiMinimumWidths } from "@/lib/profile-ui-width";
import { updateProfileUiContent } from "@/lib/profile-ui-reflow";
import type { PopoverAnchor } from "@/lib/popover-position";
import { attachDragAutoScroll, createEdgeAutoScroll } from "@/lib/drag-auto-scroll";
import { captureProfileUiDragLayout, getProfileUiContentDrop, getProfileUiDragPoint, type ProfileUiContentDrop, type ProfileUiDragLayout, type ProfileUiToolboxDragSession } from "@/lib/profile-ui-drag";
import { PROFILE_UI_TOUCH_DRAG_EVENT, startProfileUiTouchDrag, type ProfileUiTouchDragDetail } from "@/lib/profile-ui-touch-drag";
import styles from "@s/settings.module.css";
import responsiveStyles from "@s/profile-ui-responsive.module.css";

type PreviewStyle = CSSProperties & {
	"--profile-ui-preview-content-span"?: number;
	"--profile-ui-preview-height"?: string;
	"--profile-ui-preview-height-offset"?: string;
	"--profile-ui-preview-min-actual-height"?: string;
	"--profile-ui-preview-min-height"?: string;
	"--profile-ui-preview-auto-height"?: string;
	"--profile-ui-preview-radius"?: string;
	"--profile-ui-preview-opacity"?: number;
	"--profile-ui-preview-color-hue"?: number;
	"--profile-ui-preview-color-saturation"?: string;
	"--profile-ui-preview-color-lightness"?: string;
};

type PreviewShellStyle = CSSProperties & {
	"--user-hue": number;
};

type ResizeValueStyle = CSSProperties & {
	"--user-hue": number;
};

const defaultContentHeights: Record<ProfileUiContent, number> = {
	info: 783,
	stats: 745,
	me: 500,
	bestpp: PROFILE_UI_SCORE_AUTO_HEIGHT,
	first_place: PROFILE_UI_SCORE_AUTO_HEIGHT,
	most_played: PROFILE_UI_SCORE_AUTO_HEIGHT,
	recent_played: PROFILE_UI_SCORE_AUTO_HEIGHT,
	achievements: 0,
	custom_achievements: 0,
};

const toPreviewHeight = (height: number) =>
	height * PROFILE_UI_PREVIEW_HEIGHT_SCALE;

const fromPreviewHeight = (height: number) =>
	height / PROFILE_UI_PREVIEW_HEIGHT_SCALE;

const getSettingsAnchor = (event: ReactMouseEvent<HTMLElement>): PopoverAnchor => ({
	x: event.clientX,
	y: event.clientY,
	scrollContainer: event.currentTarget.closest<HTMLElement>(`.${styles.profile_ui_preview_viewport}`) ?? undefined,
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const roundWidth = (value: number) => Math.round(clamp(value, 0.01, 1) * 100) / 100;

const getContentStyle = (
	content: ProfileUiItem,
): PreviewStyle => {
	const height = getProfileUiContentHeightLimits(content.content) === null ? -1 : content.height;
	const minimumHeight = getProfileUiContentMinHeight(content.content);
	const style: PreviewStyle = {
		"--profile-ui-preview-content-span": Math.round(content.width * 100),
		"--profile-ui-preview-height":
			height === -1
				? "auto"
				: `${toPreviewHeight(Math.max(minimumHeight, height))}px`,
		"--profile-ui-preview-height-offset": "0px",
		"--profile-ui-preview-min-actual-height": `${minimumHeight}px`,
		"--profile-ui-preview-min-height":
			height === -1
				? `${toPreviewHeight(defaultContentHeights[content.content])}px`
				: "0px",
		"--profile-ui-preview-auto-height": `${toPreviewHeight(defaultContentHeights[content.content])}px`,
		"--profile-ui-preview-radius": `${content.edgeRadius}px`,
		"--profile-ui-preview-opacity": content.boxOpacity,
	};
	if (content.color !== null) {
		const color = hexToHsl(content.color);
		style["--profile-ui-preview-color-hue"] = color.hue;
		style["--profile-ui-preview-color-saturation"] = `${color.saturation}%`;
		style["--profile-ui-preview-color-lightness"] = `${color.lightness}%`;
	}
	return style;
};

type AchievementSlotClick = (contentIndex: number, slotIndex: number, event: ReactMouseEvent<HTMLButtonElement>) => void;

const ProfileUiPreviewContentBody = memo(function ProfileUiPreviewContentBody({ content, contentIndex, customAchievements, activeAchievementSlot, onAchievementSlotClick, onAchievementReorder, disabled = false }: {
	content: ProfileUiItem;
	contentIndex?: number;
	customAchievements?: CustomAchievementSelection;
	activeAchievementSlot?: number;
	onAchievementSlotClick?: AchievementSlotClick;
	onAchievementReorder?: (from: number, to: number) => void;
	disabled?: boolean;
}) {
	return <div className={styles.profile_ui_preview_surface}>
		<div className={styles.profile_ui_preview_heading} data-preview-heading>
			<FontAwesome prefix="fas" name="grip-dots"/>
			<strong>{profileUiContentLabels[content.content]}</strong>
		</div>
		<div className={styles.profile_ui_preview_mock} data-content={content.content}>
			{content.content === "info" && <><span className={styles.profile_ui_preview_mock_avatar}/><span/><span/></>}
			{content.content === "stats" && <>{Array.from({ length: 6 }, (_, index) => <span key={index}/>)}</>}
			{content.content === "me" && <ProfileUiMePreview/>}
			{content.content === "achievements" && <ProfileUiAchievementsPreview/>}
			{content.content === "custom_achievements" && <div
				onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}
				onDragStart={(event) => { event.preventDefault(); event.stopPropagation(); }}>
				<CustomAchievementSlots achievements={customAchievements ?? []} preview canRevealSecretConditions activeSlot={activeAchievementSlot} disabled={disabled}
					onReorder={onAchievementReorder}
					onSlotClick={onAchievementSlotClick && contentIndex !== undefined
						? (slotIndex, event) => onAchievementSlotClick(contentIndex, slotIndex, event) : undefined}/>
			</div>}
			{["bestpp", "first_place", "most_played", "recent_played"].includes(content.content) && <ProfileUiScorePreview height={content.height}/>}
		</div>
	</div>;
});

type DraggedItem = { kind: "content"; index: number; layout: ProfileUiDragLayout }
	| { kind: "new-content"; content: ProfileUiItem; layout: ProfileUiDragLayout };
type ResizeFeedback = { label: string; x: number; y: number };

export default function ProfileUiPreview({
	contents: savedContents, disabled, bannerUrl, backgroundUrl, profileTheme, profileHue,
	selectedContentIndex, customAchievements, activeAchievementSlot, onAchievementSlotClick, onAchievementReorder, toolboxDrag, onToolboxDragEnd, onChange, onEditContent, snappingEnabled = true,
}: Readonly<{
	contents: ProfileUiItem[];
	customAchievements?: CustomAchievementSelection;
	activeAchievementSlot?: { contentIndex: number; slotIndex: number } | null;
	onAchievementSlotClick?: AchievementSlotClick;
	onAchievementReorder?: (from: number, to: number) => void;
	disabled: boolean;
	bannerUrl: string;
	backgroundUrl: string;
	profileTheme: WebTheme;
	profileHue: number | null;
	selectedContentIndex: number | null;
	snappingEnabled?: boolean;
	toolboxDrag?: ProfileUiToolboxDragSession | null;
	onToolboxDragEnd?: () => void;
	onChange: (contents: ProfileUiItem[]) => void;
	onEditContent: (index: number, position: PopoverAnchor) => void;
}>) {
	const viewportRef = useRef<HTMLDivElement>(null);
	const gridRef = useRef<HTMLDivElement>(null);
	const { contents, minimumWidths, defaultArrangement: savedDefaultArrangement } = useProfileUiWidths(gridRef, savedContents);
	useProfileUiCompactLayout(gridRef);
	const { capture: captureDragMotion, cancel: cancelDragMotion } = useProfileUiDragMotion(viewportRef);
	const [movedItem, setMovedItem] = useState<DraggedItem | null>(null);
	const draggedItem = useMemo<DraggedItem | null>(() => toolboxDrag
		? { kind: "new-content", content: createProfileUiToolboxContent(toolboxDrag.content, 1), layout: toolboxDrag.layout }
		: movedItem, [movedItem, toolboxDrag]);
	const [dropTarget, setDropTarget] = useState<ProfileUiContentDrop | null>(null);
	const dropTargetRef = useRef<ProfileUiContentDrop | null>(null);
	const renderedDropTargetRef = useRef<ProfileUiContentDrop | null>(null);
	useLayoutEffect(() => { renderedDropTargetRef.current = dropTarget; }, [dropTarget]);
	const dropFrameRef = useRef<number | null>(null);
	const dragPointerRef = useRef<{ x: number; y: number } | null>(null);
	const touchDragCleanupRef = useRef<(() => void) | null>(null);
	const resizeCleanupRef = useRef<(() => void) | null>(null);
	const [resizeFeedback, setResizeFeedback] = useState<ResizeFeedback | null>(null);
	const [resizeAlignment, setResizeAlignment] = useState<{ index: number; width: boolean; height: boolean } | null>(null);
	const guidesRef = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		const viewport = viewportRef.current;
		const guides = guidesRef.current;
		const card = resizeAlignment ? viewport?.querySelector<HTMLElement>(`[data-preview-content="${resizeAlignment.index}"]`) : null;
		if (!viewport || !guides || !card) return;
		const bounds = viewport.getBoundingClientRect();
		const contentBounds = card.getBoundingClientRect();
		guides.style.left = `${bounds.left}px`;
		guides.style.top = `${bounds.top}px`;
		guides.style.width = `${bounds.width}px`;
		guides.style.height = `${bounds.height}px`;
		guides.style.setProperty("--profile-ui-resize-guide-x", `${contentBounds.right - bounds.left - 1}px`);
		guides.style.setProperty("--profile-ui-resize-guide-y", `${contentBounds.bottom - bounds.top - 1}px`);
	}, [contents, resizeAlignment]);
	useEffect(() => () => { touchDragCleanupRef.current?.(); resizeCleanupRef.current?.(); }, []);
	useEffect(() => { if (disabled) { touchDragCleanupRef.current?.(); resizeCleanupRef.current?.(); } }, [disabled]);
	useEffect(() => {
		if (disabled || !draggedItem || !viewportRef.current) return;
		return attachDragAutoScroll(viewportRef.current);
	}, [disabled, draggedItem]);
	useLayoutEffect(() => {
		const viewport = viewportRef.current;
		const grid = viewport?.querySelector<HTMLElement>("[data-profile-ui-grid]");
		if (!draggedItem || !viewport || !grid) return;
		const previousMinHeight = grid.style.minHeight;
		const previousAnchor = viewport.style.overflowAnchor;
		grid.style.minHeight = `${grid.getBoundingClientRect().height}px`;
		viewport.style.overflowAnchor = "none";
		return () => { grid.style.minHeight = previousMinHeight; viewport.style.overflowAnchor = previousAnchor; };
	}, [draggedItem]);
	const updateDrop = useCallback((target: ProfileUiContentDrop | null) => {
		const previous = dropTargetRef.current;
		if (previous === target || (previous && target && previous.insertionIndex === target.insertionIndex &&
			previous.edge === target.edge && previous.rowIndices.join(",") === target.rowIndices.join(","))) return;
		captureDragMotion();
		dropTargetRef.current = target;
		setDropTarget(target);
	}, [captureDragMotion]);
	const clearDragState = useCallback(() => {
		cancelDragMotion();
		if (dropFrameRef.current !== null) window.cancelAnimationFrame(dropFrameRef.current);
		dropFrameRef.current = null;
		dragPointerRef.current = null;
		dropTargetRef.current = null;
		renderedDropTargetRef.current = null;
		setMovedItem(null);
		setDropTarget(null);
		onToolboxDragEnd?.();
	}, [cancelDragMotion, onToolboxDragEnd]);
	const resolveDrop = useCallback((x: number, y: number) => {
		const viewport = viewportRef.current;
		if (disabled || !draggedItem || !viewport || (draggedItem.kind === "new-content" && contents.length >= PROFILE_UI_MAX_CONTENTS)) return updateDrop(null);
		const point = getProfileUiDragPoint(draggedItem.layout, viewport, x, y);
		if (!point) return updateDrop(null);
		const sourceIndex = draggedItem.kind === "content" ? draggedItem.index : null;
		const direction = window.innerWidth <= 600 ? "vertical" : "horizontal";
		const edgeTarget = getProfileUiContentDrop(draggedItem.layout.cards, draggedItem.layout.bounds, direction, point.x, point.y);
		const isSourceOnly = (target: ProfileUiContentDrop) => sourceIndex !== null && target.rect.index === sourceIndex && target.rowIndices.length === 1;
		// Explicit edges and gaps take priority over the broad destination surface,
		// so a preview covering an edge cannot trap the drag in its current row.
		if (edgeTarget && !isSourceOnly(edgeTarget)) return updateDrop(edgeTarget);
		// The rendered destination itself remains a valid target. Measure its
		// visible bounds so animation and scrolling are included, while retaining
		// the original layout as the basis for finding other insertion points.
		if (dropTargetRef.current && renderedDropTargetRef.current === dropTargetRef.current) {
			const preview = viewport.querySelector<HTMLElement>("[data-content-move-preview]");
			const rect = preview?.getBoundingClientRect();
			if (rect && rect.width > 0 && rect.height > 0 && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return;
		}
		const item = draggedItem.kind === "content" ? contents[draggedItem.index] : draggedItem.content;
		const target = edgeTarget ?? getProfileUiContentDrop(draggedItem.layout.cards, draggedItem.layout.bounds,
			direction, point.x, point.y, {
				sourceIndex,
				canFillRow: item.autoWidth ? (indices) => {
					const row = [...indices.filter((index) => index !== sourceIndex).map((index) => contents[index]), item];
					const minimums = getProfileUiMinimumWidths(row, draggedItem.layout.bounds.right - draggedItem.layout.bounds.left);
					const widths = fitProfileUiAutoRowWidths(row.map((content) => Math.round(content.width * 100)),
						row.map((content) => content.autoWidth === true), true, minimums);
					return widths.reduce((sum, width) => sum + width, 0) <= 100;
				} : undefined,
			});
		if (!target) return updateDrop(null);
		if (isSourceOnly(target)) return updateDrop(null);
		updateDrop(target);
	}, [contents, disabled, draggedItem, updateDrop]);
	const queueDrop = useCallback((x: number, y: number) => {
		dragPointerRef.current = { x, y };
		if (dropFrameRef.current !== null) return;
		dropFrameRef.current = window.requestAnimationFrame(() => {
			dropFrameRef.current = null;
			const point = dragPointerRef.current;
			if (point) resolveDrop(point.x, point.y);
		});
	}, [resolveDrop]);
	const commitDrop = useCallback(() => {
		const target = dropTargetRef.current;
		if (!disabled && draggedItem && target) {
			const sourceIndex = draggedItem.kind === "content" ? draggedItem.index : null;
			const item = draggedItem.kind === "content" ? contents[draggedItem.index] : draggedItem.content;
			const entries = projectProfileUiDrop(contents, draggedItem.layout, target, item, sourceIndex);
			if (entries && (sourceIndex !== null || contents.length < PROFILE_UI_MAX_CONTENTS)) onChange(commitProfileUiDrop(entries));
		}
		clearDragState();
	}, [clearDragState, contents, disabled, draggedItem, onChange]);
	useEffect(() => {
		if (!draggedItem) return;
		const viewport = viewportRef.current;
		const refresh = () => { const point = dragPointerRef.current; if (point) queueDrop(point.x, point.y); };
		viewport?.addEventListener("scroll", refresh, { passive: true });
		window.addEventListener("resize", clearDragState);
		window.addEventListener("blur", clearDragState);
		window.addEventListener("dragend", clearDragState);
		window.addEventListener("drop", clearDragState);
		return () => {
			viewport?.removeEventListener("scroll", refresh);
			window.removeEventListener("resize", clearDragState);
			window.removeEventListener("blur", clearDragState);
			window.removeEventListener("dragend", clearDragState);
			window.removeEventListener("drop", clearDragState);
			if (dropFrameRef.current !== null) window.cancelAnimationFrame(dropFrameRef.current);
			dropFrameRef.current = null;
		};
	}, [clearDragState, draggedItem, queueDrop]);
	useEffect(() => {
		const viewport = viewportRef.current;
		if (disabled || !draggedItem || !viewport) return;
		const autoScroll = createEdgeAutoScroll(viewport, { keepAlive: true });
		const pointerDrag = (event: Event) => {
			const { phase, x, y } = (event as CustomEvent<ProfileUiTouchDragDetail>).detail;
			if (phase === "cancel") return clearDragState();
			if (phase === "drop") { autoScroll.stop(); resolveDrop(x, y); commitDrop(); }
			else { queueDrop(x, y); autoScroll.update(x, y); }
		};
		window.addEventListener(PROFILE_UI_TOUCH_DRAG_EVENT, pointerDrag);
		return () => { autoScroll.stop(); window.removeEventListener(PROFILE_UI_TOUCH_DRAG_EVENT, pointerDrag); };
	}, [clearDragState, commitDrop, disabled, draggedItem, queueDrop, resolveDrop]);
	const beginTouchMove = (event: ReactPointerEvent<HTMLButtonElement>, index: number) => {
		if (disabled) return;
		touchDragCleanupRef.current?.();
		touchDragCleanupRef.current = startProfileUiTouchDrag(event, () => {
			const viewport = viewportRef.current;
			if (viewport) { setMovedItem({ kind: "content", index, layout: captureProfileUiDragLayout(viewport) }); updateDrop(null); }
		});
	};
	const updateContent = (index: number, change: Partial<ProfileUiItem>) => {
		onChange(updateProfileUiContent(contents, index, change, contents, minimumWidths));
	};
	const beginResize = (
		event: ReactPointerEvent<HTMLElement>,
		onMove: (
			deltaX: number,
			deltaY: number,
			clientX: number,
			clientY: number,
		) => void,
		initialLabel: string,
	) => {
		if (disabled) return;
		resizeCleanupRef.current?.();
		event.preventDefault();
		event.stopPropagation();
		setResizeFeedback({
			label: initialLabel,
			x: event.clientX,
			y: event.clientY,
		});
		const startX = event.clientX;
		const startY = event.clientY;
		const target = event.currentTarget;
		const heightResize = ["height", "both"].includes(target.dataset.profileUiResize ?? "");
		const viewport = viewportRef.current;
		const grid = viewport?.querySelector<HTMLElement>("[data-profile-ui-grid]");
		const previousGridMinHeight = grid?.style.minHeight ?? "";
		const previousOverflowAnchor = viewport?.style.overflowAnchor ?? "";
		if (heightResize && viewport) viewport.style.overflowAnchor = "none";
		const scrollTargets = heightResize && viewport ? [viewport] : [];
		const initialScroll = scrollTargets.map((element) => element.scrollTop);
		let pointerX = startX;
		let pointerY = startY;
		let lastDeltaX = 0;
		let lastDeltaY = 0;
		let finished = false;
		let hasMoved = false;
		const updateSize = () => {
			if (finished || !hasMoved) return;
			const deltaX = pointerX - startX;
			const deltaY = pointerY - startY + scrollTargets.reduce((sum, element, index) => sum + element.scrollTop - initialScroll[index], 0);
			if (deltaX === lastDeltaX && deltaY === lastDeltaY) return;
			lastDeltaX = deltaX;
			lastDeltaY = deltaY;
			// Keep the scroll range while shrinking the last card. Otherwise the
			// browser's scroll clamp would be counted as another resize movement.
			if (heightResize && grid) {
				const height = `${grid.getBoundingClientRect().height}px`;
				if (grid.style.minHeight !== height) grid.style.minHeight = height;
			}
			onMove(deltaX, deltaY, pointerX, pointerY);
		};
		const autoScroll = heightResize && viewport ? createEdgeAutoScroll(viewport, {
			getTargets: () => scrollTargets,
			onScroll: updateSize,
			keepAlive: true,
			edgeSize: 48,
			maxSpeed: 360,
		}) : null;
		target.setPointerCapture(event.pointerId);
		const move = (pointerEvent: PointerEvent) => {
			if (pointerEvent.pointerId !== event.pointerId) return;
			pointerX = pointerEvent.clientX;
			pointerY = pointerEvent.clientY;
			if (Math.hypot(pointerX - startX, pointerY - startY) >= 3) hasMoved = true;
			if (hasMoved) autoScroll?.update(pointerX, pointerY);
			updateSize();
		};
		const finish = () => {
			if (finished) return;
			finished = true;
			autoScroll?.stop();
			resizeCleanupRef.current = null;
			setResizeFeedback(null);
			setResizeAlignment(null);
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", end);
			window.removeEventListener("pointercancel", end);
			window.removeEventListener("blur", finish);
			for (const element of scrollTargets) element.removeEventListener("scroll", updateSize);
			if (heightResize && grid) grid.style.minHeight = previousGridMinHeight;
			if (heightResize && viewport) viewport.style.overflowAnchor = previousOverflowAnchor;
			if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
		};
		const end = (pointerEvent: PointerEvent) => {
			if (pointerEvent.pointerId === event.pointerId) finish();
		};
		resizeCleanupRef.current = finish;
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", end);
		window.addEventListener("pointercancel", end);
		window.addEventListener("blur", finish);
		for (const element of scrollTargets) element.addEventListener("scroll", updateSize, { passive: true });
	};

	const resizeContent = (event: ReactPointerEvent<HTMLElement>, index: number, axis: "width" | "height" | "both") => {
		const content = contents[index];
		const limits = getProfileUiContentHeightLimits(content.content);
		if (!limits && axis !== "width") return;
		const card = event.currentTarget.closest<HTMLElement>("article");
		const gridWidth = card?.parentElement?.clientWidth ?? 1;
		const canResizeWidth = axis !== "height" && (!card || getComputedStyle(card).gridColumn !== "1 / -1");
		const cardStyle = card ? getComputedStyle(card) : null;
		const fullWidth = cardStyle?.gridColumn === "1 / -1";
		const geometry: ProfileUiResizeGeometry | null = card ? {
			bounds: card.getBoundingClientRect(),
			neighbors: Array.from(viewportRef.current?.querySelectorAll<HTMLElement>("[data-preview-content]") ?? [])
				.filter((element) => element !== card).map((element) => {
					const { left, right, top, bottom } = element.getBoundingClientRect();
					return { left, right, top, bottom, index: Number(element.dataset.previewContent),
						followsRowHeight: !fullWidth && element.dataset.matchRow === "true" };
				}),
			gridWidth,
			horizontalMargin: (Number.parseFloat(cardStyle?.marginLeft ?? "0") || 0) + (Number.parseFloat(cardStyle?.marginRight ?? "0") || 0),
			columnSpans: contents.map((item) => fullWidth ? 100 : Math.round(item.width * 100)),
			contentIndex: index,
			fullWidth,
			reflowWidths: canResizeWidth,
			autoWidths: contents.map((item) => item.autoWidth === true),
			minimumWidths,
		} : null;
		const minimum = getProfileUiContentMinHeight(content.content);
		const minimumWidth = (minimumWidths[index] ?? 1) / 100;
		const startPreviewHeight = card?.getBoundingClientRect().height ?? toPreviewHeight(minimum);
		const startHeight = content.height === -1 ? fromPreviewHeight(startPreviewHeight) : content.height;
		beginResize(event, (deltaX, deltaY, x, y) => {
			const width = canResizeWidth ? clamp(content.width + deltaX / gridWidth, minimumWidth, 1) : content.width;
			let snapAxis = axis;
			if (axis === "both") {
				if (!canResizeWidth || Math.abs(deltaX) < 3) snapAxis = "height";
				else if (Math.abs(deltaY) < 3) snapAxis = "width";
			}
			const height = axis === "width" ? content.height
				: Math.round(clamp(startHeight + fromPreviewHeight(deltaY), minimum, limits?.max ?? 2400));
			const result = snappingEnabled && geometry ? snapProfileUiResize(width, height, snapAxis, geometry, minimum, limits?.max)
				: { width: roundWidth(width), height, snapped: false, snappedWidth: false, snappedHeight: false };
			const label = axis === "width" ? `W ${result.width.toFixed(2)}` : canResizeWidth ? `W ${result.width.toFixed(2)} · H ${result.height}px` : `H ${result.height}px`;
			setResizeFeedback({ label: `${label}${result.snapped ? " · Aligned" : ""}`, x, y });
			setResizeAlignment(result.snapped ? { index, width: result.snappedWidth, height: result.snappedHeight } : null);
			updateContent(index, { width: result.width, height: result.height });
		}, axis === "width" ? `W ${content.width.toFixed(2)}` : `H ${Math.round(startHeight)}px`);
	};
	const resetSize = (event: ReactMouseEvent<HTMLElement>, index: number, axis: "width" | "height" | "both") => {
		event.preventDefault(); event.stopPropagation();
		if (disabled) return;
		resizeCleanupRef.current?.();
		const content = contents[index];
		const autoWidth = axis !== "height";
		const autoHeight = axis !== "width";
		if ((!autoWidth || content.autoWidth) && (!autoHeight || content.height === -1)) return;
		updateContent(index, {
			...(autoWidth ? { autoWidth: true } : {}),
			...(autoHeight ? { height: -1 } : {}),
		});
	};
	const shellStyle: PreviewShellStyle = { ...getProfileUiScoreLayoutStyle(PROFILE_UI_PREVIEW_HEIGHT_SCALE), "--user-hue": profileHue ?? 210 };
	const feedbackStyle: ResizeValueStyle | undefined = resizeFeedback ? {
		"--user-hue": profileHue ?? 210,
		left: clamp(resizeFeedback.x + 14, 8, Math.max(8, window.innerWidth - 160)),
		top: clamp(resizeFeedback.y + 14, 8, Math.max(8, window.innerHeight - 48)),
	} : undefined;
	const draggedContent = draggedItem?.kind === "new-content" ? draggedItem.content : draggedItem?.kind === "content" ? contents[draggedItem.index] : null;
	const previewLayout = useMemo(() => {
		const projected = draggedItem && draggedContent && dropTarget
			? projectProfileUiDrop(contents, draggedItem.layout, dropTarget, draggedContent, draggedItem.kind === "content" ? draggedItem.index : null)
			: null;
		const entries = projected ?? contents.map((content, index) => ({ content, index }));
		const matches = getProfileUiRowHeightMatches(entries.map((entry) => entry.content));
		return {
			projected,
			entries: new Map(entries.map((entry, order) => [entry.index, { ...entry, order }])),
			rowMatches: new Map(entries.map((entry, index) => [entry.index, matches[index]])),
			defaultArrangement: !projected && savedDefaultArrangement,
		};
	}, [contents, draggedContent, draggedItem, dropTarget, savedDefaultArrangement]);
	const { rowMatches, defaultArrangement } = previewLayout;
	const ghost = previewLayout.entries.get(-1);
	const origin = draggedItem?.kind === "content" ? draggedItem.layout.cards.find((card) => card.index === draggedItem.index) : null;
	const originStyle: CSSProperties | undefined = origin && draggedItem && previewLayout.projected ? {
		left: origin.left - draggedItem.layout.bounds.left,
		top: origin.top - draggedItem.layout.bounds.top,
		width: origin.right - origin.left,
		height: origin.bottom - origin.top,
		minHeight: 0,
		margin: 0,
		gridColumn: "auto",
		gridRow: "auto",
	} : undefined;
	const renderGhost = () => ghost && <article
		className={`${styles.profile_ui_preview_content} ${styles.profile_ui_preview_content_move_preview}`}
		data-content={ghost.content.content} data-custom-color={ghost.content.color !== null}
		data-fixed-height={getProfileUiContentHeightLimits(ghost.content.content) !== null && ghost.content.height !== -1}
		data-row-height={isProfileUiRowHeight(ghost.content.content)} data-match-row={rowMatches.get(-1)}
		data-auto-height={isProfileUiAutoHeight(ghost.content)}
		data-score-content={["bestpp", "first_place", "most_played", "recent_played"].includes(ghost.content.content)}
		data-content-move-preview style={{ ...getContentStyle(ghost.content), order: ghost.order }} aria-hidden="true"
	><ProfileUiPreviewContentBody content={ghost.content} customAchievements={customAchievements}/><span className={styles.profile_ui_preview_move_label}>Drop here</span></article>;

	return <>
		<div className={`${styles.profile_ui_preview_shell} ${responsiveStyles.profile_ui_responsive}`} data-theme-independent="true" data-profile-theme={getWebThemeName(profileTheme)} data-custom-hue={profileHue !== null} style={shellStyle}>
			<div className={styles.profile_ui_preview_toolbar}>
				<span><FontAwesome prefix="fad" name="desktop"/> Live profile preview</span>
				<small>Drag content to move, resize from the highlighted edges, or right-click for settings.</small>
			</div>
			<div ref={viewportRef} className={styles.profile_ui_preview_viewport} data-profile-ui-preview data-profile-ui-dragging={!!draggedItem}
				onDragOverCapture={(event) => {
					if (disabled || !draggedItem) return;
					event.preventDefault(); event.stopPropagation();
					event.dataTransfer.dropEffect = draggedItem.kind === "new-content" ? "copy" : "move";
					queueDrop(event.clientX, event.clientY);
				}}
				onDropCapture={(event) => {
					if (!draggedItem) return;
					event.preventDefault(); event.stopPropagation();
					resolveDrop(event.clientX, event.clientY); commitDrop();
				}}
				onDragLeave={(event) => {
					const rect = event.currentTarget.getBoundingClientRect();
					if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
						if (dropFrameRef.current !== null) window.cancelAnimationFrame(dropFrameRef.current);
						dropFrameRef.current = null; dragPointerRef.current = null; updateDrop(null);
					}
				}}>
				{backgroundUrl && <Image className={styles.profile_ui_preview_background} src={backgroundUrl} alt="Profile background" fill sizes="900px" draggable={false}/>}
				<div className={styles.profile_ui_preview_cover}>{bannerUrl && <Image className={styles.profile_ui_preview_banner} src={bannerUrl} alt="Profile banner" fill sizes="800px" draggable={false}/>}</div>
				<div ref={gridRef} className={`${styles.profile_ui_preview_grid}${defaultArrangement ? ` ${responsiveStyles.profile_ui_default_layout}` : ""}`} data-profile-ui-grid data-profile-ui-default={defaultArrangement}>
					{contents.map((content, index) => <Fragment key={index}>
						<article className={styles.profile_ui_preview_content} data-preview-content={index} data-content={content.content}
							data-selected={selectedContentIndex === index} data-custom-color={content.color !== null}
							data-fixed-height={getProfileUiContentHeightLimits(content.content) !== null && content.height !== -1} data-row-height={isProfileUiRowHeight(content.content)} data-match-row={rowMatches.get(index)} data-score-content={["bestpp", "first_place", "most_played", "recent_played"].includes(content.content)}
							data-auto-height={isProfileUiAutoHeight(content)}
							data-drag-source={draggedItem?.kind === "content" && draggedItem.index === index}
							data-move-source={draggedItem?.kind === "content" && draggedItem.index === index && !!previewLayout.projected}
							style={{ ...getContentStyle(previewLayout.entries.get(index)?.content ?? content), order: previewLayout.entries.get(index)?.order,
								...(draggedItem?.kind === "content" && draggedItem.index === index ? originStyle : undefined) }} draggable={!disabled}
							onDragStart={(event) => {
								event.stopPropagation();
								const viewport = viewportRef.current;
								if (disabled || !viewport) return event.preventDefault();
								event.dataTransfer.effectAllowed = "move";
								event.dataTransfer.setData("text/profile-ui", String(index));
								setMovedItem({ kind: "content", index, layout: captureProfileUiDragLayout(viewport) }); updateDrop(null);
							}}
							onDragEnd={clearDragState}
							onContextMenu={(event) => { event.preventDefault(); event.stopPropagation(); if (!disabled) onEditContent(index, getSettingsAnchor(event)); }}>
							<ProfileUiPreviewContentBody content={content} contentIndex={index} customAchievements={customAchievements}
								activeAchievementSlot={activeAchievementSlot?.contentIndex === index ? activeAchievementSlot.slotIndex : undefined}
								onAchievementSlotClick={onAchievementSlotClick} onAchievementReorder={onAchievementReorder} disabled={disabled}/>
							<button type="button" className={styles.profile_ui_preview_touch_content_move} aria-label={`Move ${profileUiContentLabels[content.content]}`} disabled={disabled} draggable={!disabled} onPointerDown={(event) => beginTouchMove(event, index)}><FontAwesome prefix="fas" name="grip-dots"/></button>
							<button type="button" className={styles.profile_ui_preview_touch_settings} aria-label={`Edit ${profileUiContentLabels[content.content]}`} disabled={disabled} draggable={false} onDragStart={(event) => { event.preventDefault(); event.stopPropagation(); }} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onEditContent(index, getSettingsAnchor(event)); }}><FontAwesome prefix="fas" name="sliders"/></button>
							<button type="button" className={styles.profile_ui_preview_remove_button} aria-label={`Remove ${profileUiContentLabels[content.content]}`} disabled={disabled} draggable={false} onDragStart={(event) => { event.preventDefault(); event.stopPropagation(); }} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); if (!disabled) { onChange(normalizeProfileUi(contents.filter((_, current) => current !== index))); clearDragState(); } }}><FontAwesome prefix="fas" name="minus"/></button>
							<button type="button" className={styles.profile_ui_preview_width_handle} data-profile-ui-resize="width" aria-label={`Resize ${profileUiContentLabels[content.content]} width`} title="Double-click to use auto width" disabled={disabled} onPointerDown={(event) => resizeContent(event, index, "width")} onDoubleClick={(event) => resetSize(event, index, "width")}/>
							{getProfileUiContentHeightLimits(content.content) !== null && <>
							<button type="button" className={styles.profile_ui_preview_height_handle} data-profile-ui-resize="height" aria-label={`Resize ${profileUiContentLabels[content.content]} height`} title="Double-click to use auto height" disabled={disabled} onPointerDown={(event) => resizeContent(event, index, "height")} onDoubleClick={(event) => resetSize(event, index, "height")}/>
							<button type="button" className={styles.profile_ui_preview_corner_handle} data-profile-ui-resize="both" aria-label={`Resize ${profileUiContentLabels[content.content]} size`} title="Drag to resize. Double-click for auto width and height." disabled={disabled} onPointerDown={(event) => resizeContent(event, index, "both")} onDoubleClick={(event) => resetSize(event, index, "both")}/>
							</>}
						</article>
					</Fragment>)}
					{renderGhost()}
					{contents.length === 0 && !ghost && <p className={styles.profile_ui_preview_empty}>Drag content here or add it from the toolbox.</p>}
				</div>
			</div>
		</div>
		{resizeAlignment && snappingEnabled && createPortal(
			<div ref={guidesRef} className={styles.profile_ui_preview_resize_guides} style={{ "--user-hue": profileHue ?? 210 } as ResizeValueStyle} data-theme-independent="true" data-profile-ui-resize-guides aria-hidden="true">
				{resizeAlignment.width && <span data-snap-axis="width"/>}
				{resizeAlignment.height && <span data-snap-axis="height"/>}
			</div>, document.body)}
		{resizeFeedback && createPortal(<output className={styles.profile_ui_preview_resize_value} style={feedbackStyle}>{resizeFeedback.label}</output>, document.body)}
	</>;
}
