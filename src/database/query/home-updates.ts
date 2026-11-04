import { HOME_UPDATES_PAGE_SIZE } from "@/lib/home-updates";

const columns = "id, version, category, title, contents";

export const homeUpdatesQuery = `
	SELECT ${columns} FROM patch_notes
	WHERE id < ?
	ORDER BY id DESC LIMIT ${HOME_UPDATES_PAGE_SIZE + 1}
`;

export const homeUpdateByIdQuery = `SELECT ${columns} FROM patch_notes WHERE id = ? FOR UPDATE`;
export const createHomeUpdateQuery = "INSERT INTO patch_notes (version, category, title, contents) VALUES (?, ?, ?, ?)";
export const editHomeUpdateQuery = "UPDATE patch_notes SET version = ?, category = ?, title = ?, contents = ? WHERE id = ?";
export const deleteHomeUpdateQuery = "DELETE FROM patch_notes WHERE id = ?";
