export type BadgeImageExtension = "gif" | "png";

const GIF_BADGES = new Set([2, 4, 5, 39, 40]);

export const getBadgeImageExtension = (badgeId: number): BadgeImageExtension =>
	GIF_BADGES.has(badgeId) ? "gif" : "png";
