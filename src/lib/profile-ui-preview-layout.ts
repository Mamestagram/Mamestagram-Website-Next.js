export const PROFILE_UI_PREVIEW_HEIGHT_SCALE = 0.5;

export const getProfileUiPreviewWidth = (
	viewport: HTMLElement | undefined,
	contentIndex: number,
): number | undefined => {
	const element = viewport?.querySelector<HTMLElement>(`[data-preview-content="${contentIndex}"]`);
	const grid = element?.parentElement;
	if (!element || !grid || grid.clientWidth <= 0) return undefined;
	const style = getComputedStyle(element);
	const margin = (Number.parseFloat(style.marginLeft) || 0) + (Number.parseFloat(style.marginRight) || 0);
	return Math.max(0.01, Math.min(1, Math.round((element.getBoundingClientRect().width + margin) / grid.clientWidth * 100) / 100));
};

export const getProfileUiPreviewHeight = (
	viewport: HTMLElement | undefined,
	contentIndex: number,
): number | undefined => {
	const element = viewport?.querySelector<HTMLElement>(`[data-preview-content="${contentIndex}"]`);
	const height = element?.getBoundingClientRect().height;
	return height !== undefined && Number.isFinite(height) && height > 0
		? height / PROFILE_UI_PREVIEW_HEIGHT_SCALE
		: undefined;
};
