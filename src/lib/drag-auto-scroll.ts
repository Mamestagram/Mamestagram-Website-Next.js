const EDGE_SIZE = 96;
const MAX_SPEED = 900;

type EdgeAutoScrollOptions = {
	getTargets?: () => HTMLElement[];
	onScroll?: () => void;
	keepAlive?: boolean;
	edgeSize?: number;
	maxSpeed?: number;
};

export const createEdgeAutoScroll = (viewport: HTMLElement, options: EdgeAutoScrollOptions = {}) => {
	const doc = viewport.ownerDocument;
	const view = doc.defaultView;
	if (!view) return { update: () => {}, stop: () => {} };
	let pointer: { x: number; y: number } | null = null;
	let frame: number | null = null;
	let previousTime: number | null = null;
	const stop = () => {
		if (frame !== null) view.cancelAnimationFrame(frame);
		frame = null;
		pointer = null;
		previousTime = null;
	};
	const tick = (time: number) => {
		frame = null;
		if (!pointer || !viewport.isConnected) return stop();
		const rect = viewport.getBoundingClientRect();
		if (pointer.x < rect.left || pointer.x > rect.right || pointer.y < rect.top || pointer.y > rect.bottom) return stop();
		const targets = options.getTargets?.() ?? [viewport];
		const elapsed = previousTime === null ? 1000 / 60 : Math.min(50, Math.max(0, time - previousTime));
		previousTime = time;
		let atEdge = false;
		for (const target of targets) {
			const targetRect = target.getBoundingClientRect();
			const top = Math.max(rect.top, targetRect.top);
			const bottom = Math.min(rect.bottom, targetRect.bottom);
			const edge = Math.min(options.edgeSize ?? EDGE_SIZE, (bottom - top) / 3);
			if (edge <= 0 || pointer.y < top || pointer.y > bottom) continue;
			const maxSpeed = options.maxSpeed ?? MAX_SPEED;
			const speed = pointer.y < top + edge
				? -maxSpeed * (1 - (pointer.y - top) / edge)
				: pointer.y > bottom - edge
					? maxSpeed * (1 - (bottom - pointer.y) / edge)
					: 0;
			if (speed === 0) continue;
			atEdge = true;
			const previousScroll = target.scrollTop;
			target.scrollTop = Math.max(0, Math.min(target.scrollHeight - target.clientHeight, previousScroll + speed * elapsed / 1000));
			if (target.scrollTop !== previousScroll) {
				options.onScroll?.();
				if (pointer) frame = view.requestAnimationFrame(tick);
				return;
			}
		}
		if (atEdge && options.keepAlive) frame = view.requestAnimationFrame(tick);
		else stop();
	};
	const update = (x: number, y: number) => {
		const rect = viewport.getBoundingClientRect();
		if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return stop();
		pointer = { x, y };
		if (frame === null) {
			previousTime = null;
			frame = view.requestAnimationFrame(tick);
		}
	};
	return { update, stop };
};

// Keep scrolling during a native drag even when the pointer stops moving.
export const attachDragAutoScroll = (viewport: HTMLElement, nestedSelector?: string): (() => void) => {
	const doc = viewport.ownerDocument;
	const view = doc.defaultView;
	if (!view) return () => {};
	let ended = false;
	let pointer = { x: 0, y: 0 };
	const controller = createEdgeAutoScroll(viewport, {
		getTargets: () => {
			const nested = nestedSelector ? doc.elementFromPoint(pointer.x, pointer.y)?.closest<HTMLElement>(nestedSelector) : null;
			return nested && viewport.contains(nested) ? [nested, viewport] : [viewport];
		},
	});
	const stop = controller.stop;
	const onDragOver = (event: DragEvent) => {
		if (ended) return;
		const rect = viewport.getBoundingClientRect();
		if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return stop();
		event.preventDefault();
		pointer = { x: event.clientX, y: event.clientY };
		controller.update(pointer.x, pointer.y);
	};
	const onDragLeave = (event: DragEvent) => {
		if (event.relatedTarget === null && (event.clientX <= 0 || event.clientY <= 0 || event.clientX >= view.innerWidth || event.clientY >= view.innerHeight)) stop();
	};
	const finish = () => { ended = true; stop(); };
	doc.addEventListener("dragover", onDragOver, true);
	doc.addEventListener("dragleave", onDragLeave, true);
	doc.addEventListener("drop", finish, true);
	doc.addEventListener("dragend", finish, true);
	view.addEventListener("blur", stop);
	return () => {
		finish();
		doc.removeEventListener("dragover", onDragOver, true);
		doc.removeEventListener("dragleave", onDragLeave, true);
		doc.removeEventListener("drop", finish, true);
		doc.removeEventListener("dragend", finish, true);
		view.removeEventListener("blur", stop);
	};
};
