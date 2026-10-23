const suppressedFocusTargets = new WeakSet<HTMLElement>();

export const isTooltipFocusSuppressed = (target: EventTarget | null) =>
	target instanceof HTMLElement && suppressedFocusTargets.has(target);

export const focusWithoutTooltip = (element: HTMLElement | null | undefined) => {
	if (!element) return;
	suppressedFocusTargets.add(element);
	try {
		element.focus({ preventScroll: true });
	} finally {
		suppressedFocusTargets.delete(element);
	}
};
