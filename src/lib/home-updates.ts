export const HOME_UPDATE_TITLE_MAX_LENGTH = 64;
export const HOME_UPDATE_VERSION_MAX_LENGTH = 16;
export const HOME_UPDATE_CONTENTS_MAX_BYTES = 65_535;
export const HOME_UPDATES_PAGE_SIZE = 10;

export type HomeUpdateCategory = "updates" | "fix";
export type HomeUpdateInput = { version: string; category: HomeUpdateCategory; title: string; contents: string };
export type HomeUpdate = HomeUpdateInput & { id: number };
export type HomeUpdatesPage = { items: HomeUpdate[]; nextCursor: number | null };

export const parseHomeUpdateInput = (value: unknown): HomeUpdateInput | null => {
	if (typeof value !== "object" || value === null || !("category" in value) || !("title" in value) || !("version" in value) || !("contents" in value)) return null;
	if ((value.category !== "updates" && value.category !== "fix") || typeof value.title !== "string" || typeof value.version !== "string" || typeof value.contents !== "string") return null;
	const title = value.title.trim().replace(/\s+/g, " ");
	const version = value.version.trim().replace(/\s+/g, " ");
	const contents = value.contents;
	if (!title || Array.from(title).length > HOME_UPDATE_TITLE_MAX_LENGTH) return null;
	if (!version || Array.from(version).length > HOME_UPDATE_VERSION_MAX_LENGTH || contents.length > HOME_UPDATE_CONTENTS_MAX_BYTES || new TextEncoder().encode(contents).length > HOME_UPDATE_CONTENTS_MAX_BYTES) return null;
	return { version, category: value.category, title, contents };
};

export const isHomeUpdateId = (value: unknown): value is number =>
	typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= 2_147_483_647;

export const parseHomeUpdatesPage = (value: unknown): HomeUpdatesPage | null => {
	if (typeof value !== "object" || value === null || !("items" in value) || !Array.isArray(value.items) || !("nextCursor" in value)) return null;
	if (value.nextCursor !== null && !isHomeUpdateId(value.nextCursor)) return null;
	const items: HomeUpdate[] = [];
	const rawItems: unknown[] = value.items;
	for (const item of rawItems) {
		const input = parseHomeUpdateInput(item);
		if (!input || typeof item !== "object" || item === null || !("id" in item) || !isHomeUpdateId(item.id)) return null;
		items.push({ ...input, id: item.id });
	}
	return { items, nextCursor: value.nextCursor };
};
