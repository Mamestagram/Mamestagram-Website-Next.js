export const MAX_CUSTOM_ACHIEVEMENTS = 8;

export const customAchievementCategories = [
	{ value: "skill", label: "Skill" },
	{ value: "mod", label: "Mod" },
	{ value: "mamestagram", label: "Mamestagram" },
] as const;

export const getCustomAchievementCategory = (filename: string): (typeof customAchievementCategories)[number]["value"] => {
	if (/^(osu|taiko|fruits|mania|skill)-/i.test(filename)) return "skill";
	if (/^all-/i.test(filename)) return "mod";
	return "mamestagram";
};

export type CustomAchievement = {
	id: number;
	filename: string;
	name: string;
	description: string;
	condDescription: string;
};

export type CustomAchievementSettings = {
	achievements: CustomAchievement[];
	selectedIds: CustomAchievementIds;
};

export type CustomAchievementIds = (number | null)[];
export type CustomAchievementSelection = (CustomAchievement | null)[];

export const createEmptyCustomAchievementIds = (): CustomAchievementIds =>
	Array.from({ length: MAX_CUSTOM_ACHIEVEMENTS }, () => null);

export const parseCustomAchievementIds = (value: unknown): CustomAchievementIds | null => {
	if (!Array.isArray(value) || value.length > MAX_CUSTOM_ACHIEVEMENTS ||
		!Array.from(value).every((id) => id === null || (typeof id === "number" && Number.isSafeInteger(id) && id > 0))) return null;
	const ids = value.filter((id): id is number => id !== null);
	if (new Set(ids).size !== ids.length) return null;
	return Array.from({ length: MAX_CUSTOM_ACHIEVEMENTS }, (_, index) => value[index] ?? null);
};

export const areCustomAchievementIdsEqual = (left: CustomAchievementIds, right: CustomAchievementIds) =>
	left.length <= MAX_CUSTOM_ACHIEVEMENTS && right.length <= MAX_CUSTOM_ACHIEVEMENTS &&
	Array.from({ length: MAX_CUSTOM_ACHIEVEMENTS }, (_, index) => (left[index] ?? null) === (right[index] ?? null)).every(Boolean);

export const setCustomAchievementSlot = (ids: CustomAchievementIds, index: number, achievementId: number | null): CustomAchievementIds => {
	if (!Number.isInteger(index) || index < 0 || index >= MAX_CUSTOM_ACHIEVEMENTS) return ids;
	if ((ids[index] ?? null) === achievementId) return ids;
	const next = parseCustomAchievementIds(ids);
	if (!next) return ids;
	const previousIndex = achievementId === null ? -1 : ids.indexOf(achievementId);
	if (previousIndex !== -1) next[previousIndex] = next[index];
	next[index] = achievementId;
	return next;
};

export const moveCustomAchievement = (ids: CustomAchievementIds, from: number, to: number): CustomAchievementIds => {
	if (!Number.isInteger(from) || from < 0 || from >= MAX_CUSTOM_ACHIEVEMENTS || ids[from] == null) return ids;
	return setCustomAchievementSlot(ids, to, ids[from]);
};

export const getSelectedCustomAchievements = (achievements: CustomAchievement[], ids: CustomAchievementIds): CustomAchievementSelection => {
	const byId = new Map(achievements.map((achievement) => [achievement.id, achievement]));
	return Array.from({ length: MAX_CUSTOM_ACHIEVEMENTS }, (_, index) => {
		const id = ids[index];
		return id == null ? null : byId.get(id) ?? null;
	});
};

export const parseCustomAchievements = (value: unknown): CustomAchievementSelection | null => {
	if (!Array.isArray(value) || !parseCustomAchievementIds(value.map((item: unknown) =>
		item === null ? null : typeof item === "object" && "id" in item ? item.id : undefined))) return null;
	const achievements: CustomAchievementSelection = [];
	for (const item of value) {
		if (item === null) { achievements.push(null); continue; }
		const raw = item as Record<string, unknown>;
		if (typeof raw.filename !== "string" || !/^[a-z\d_-]+$/i.test(raw.filename) ||
			typeof raw.name !== "string" || typeof raw.description !== "string" || typeof raw.condDescription !== "string") return null;
		achievements.push({ id: raw.id as number, filename: raw.filename, name: raw.name,
			description: raw.description, condDescription: raw.condDescription });
	}
	while (achievements.length < MAX_CUSTOM_ACHIEVEMENTS) achievements.push(null);
	return achievements;
};

export const getCustomAchievementImageUrl = (filename: string) =>
	`https://assets.mamesosu.net/medals/client/${encodeURIComponent(filename)}@2x.png`;
