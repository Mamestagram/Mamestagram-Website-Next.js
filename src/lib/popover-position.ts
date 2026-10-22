export type PopoverAnchor = {
	x: number;
	y: number;
	scrollContainer?: HTMLElement;
};
type Size = { width: number; height: number };

export const getPopoverPosition = (
	anchor: PopoverAnchor,
	size: Size,
	viewport: Size,
	padding = 8,
) => ({
	left: Math.max(padding, Math.min(anchor.x, viewport.width - size.width - padding)),
	top: Math.max(padding, Math.min(anchor.y, viewport.height - size.height - padding)),
});
