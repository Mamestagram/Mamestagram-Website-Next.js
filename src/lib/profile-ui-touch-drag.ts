"use client";

import { flushSync } from "react-dom";

export const PROFILE_UI_TOUCH_DRAG_EVENT = "profile-ui-touch-drag";
export type ProfileUiTouchDragDetail = { phase: "move" | "drop" | "cancel"; x: number; y: number };

type TouchDragStart = {
	pointerType: string;
	pointerId: number;
	clientX: number;
	clientY: number;
	currentTarget: HTMLElement;
	preventDefault: () => void;
	stopPropagation: () => void;
};

// Only the dedicated grips disable touch scrolling; the surrounding canvas stays scrollable.
export const startProfileUiTouchDrag = (event: TouchDragStart, onStart: () => void) => {
	if (event.pointerType !== "touch" && event.pointerType !== "pen") return () => {};
	event.preventDefault();
	event.stopPropagation();
	const target = event.currentTarget;
	const view = target.ownerDocument.defaultView;
	if (!view) return () => {};
	const pointerId = event.pointerId;
	const start = { x: event.clientX, y: event.clientY };
	let point = start;
	let active = false;
	let finished = false;
	const emit = (phase: ProfileUiTouchDragDetail["phase"]) => view.dispatchEvent(new CustomEvent<ProfileUiTouchDragDetail>(PROFILE_UI_TOUCH_DRAG_EVENT, { detail: { ...point, phase } }));
	const finish = (phase: "drop" | "cancel") => {
		if (finished) return;
		finished = true;
		view.removeEventListener("pointermove", move);
		view.removeEventListener("pointerup", end);
		view.removeEventListener("pointercancel", cancelPointer);
		view.removeEventListener("blur", cancel);
		view.removeEventListener("resize", cancel);
		view.removeEventListener("keydown", escape, true);
		if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId);
		if (active) emit(phase);
	};
	const move = (pointer: PointerEvent) => {
		if (pointer.pointerId !== pointerId) return;
		pointer.preventDefault();
		point = { x: pointer.clientX, y: pointer.clientY };
		if (!active && Math.hypot(point.x - start.x, point.y - start.y) >= 6) {
			active = true;
			flushSync(onStart);
		}
		if (active) emit("move");
	};
	const end = (pointer: PointerEvent) => {
		if (pointer.pointerId !== pointerId) return;
		point = { x: pointer.clientX, y: pointer.clientY };
		finish("drop");
	};
	const cancel = () => finish("cancel");
	const cancelPointer = (pointer: PointerEvent) => { if (pointer.pointerId === pointerId) cancel(); };
	const escape = (key: KeyboardEvent) => {
		if (key.key !== "Escape") return;
		key.preventDefault();
		key.stopImmediatePropagation();
		cancel();
	};
	target.setPointerCapture(pointerId);
	view.addEventListener("pointermove", move, { passive: false });
	view.addEventListener("pointerup", end);
	view.addEventListener("pointercancel", cancelPointer);
	view.addEventListener("blur", cancel);
	view.addEventListener("resize", cancel);
	view.addEventListener("keydown", escape, true);
	return cancel;
};
