import "server-only";

import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { executeQuery, withTransaction } from "@/database/connection";
import { createHomeUpdateQuery, deleteHomeUpdateQuery, editHomeUpdateQuery, homeUpdateByIdQuery, homeUpdatesQuery } from "@/database/query/home-updates";
import { HOME_UPDATES_PAGE_SIZE, type HomeUpdate, type HomeUpdateInput, type HomeUpdatesPage } from "@/lib/home-updates";

type HomeUpdateRow = RowDataPacket & HomeUpdate;

export class HomeUpdatesSchemaError extends Error {
	constructor() {
		super("Updates storage is not configured. Check the existing patch_notes table and its columns.");
	}
}

const rethrowDatabaseError = (error: unknown): never => {
	const cause = error instanceof Error && error.cause ? error.cause : error;
	if (typeof cause === "object" && cause !== null && "code" in cause && (cause.code === "ER_NO_SUCH_TABLE" || cause.code === "ER_BAD_FIELD_ERROR")) throw new HomeUpdatesSchemaError();
	throw error;
};

const toHomeUpdate = (row: HomeUpdateRow): HomeUpdate => ({
	id: row.id,
	version: row.version,
	category: row.category,
	title: row.title,
	contents: row.contents,
});

export const getHomeUpdates = async (beforeId = 2_147_483_648): Promise<HomeUpdatesPage> => {
	try {
		const rows = await executeQuery<HomeUpdateRow>(homeUpdatesQuery, [beforeId]);
		const items = rows.slice(0, HOME_UPDATES_PAGE_SIZE).map(toHomeUpdate);
		return { items, nextCursor: rows.length > HOME_UPDATES_PAGE_SIZE ? items[items.length - 1].id : null };
	} catch (error: unknown) {
		return rethrowDatabaseError(error);
	}
};

export const saveHomeUpdate = async (id: number | null, input: HomeUpdateInput): Promise<HomeUpdate | null> => {
	try {
		return await withTransaction(async (connection) => {
			if (id === null) {
				const [result] = await connection.query<ResultSetHeader>(createHomeUpdateQuery, [input.version, input.category, input.title, input.contents]);
				id = result.insertId;
			} else {
				const [existing] = await connection.query<HomeUpdateRow[]>(homeUpdateByIdQuery, [id]);
				if (existing.length === 0) return null;
				await connection.query(editHomeUpdateQuery, [input.version, input.category, input.title, input.contents, id]);
			}
			const [rows] = await connection.query<HomeUpdateRow[]>(homeUpdateByIdQuery, [id]);
			return toHomeUpdate(rows[0]);
		});
	} catch (error: unknown) {
		return rethrowDatabaseError(error);
	}
};

export const deleteHomeUpdate = async (id: number): Promise<boolean> => {
	try {
		return await withTransaction(async (connection) => {
			const [result] = await connection.query<ResultSetHeader>(deleteHomeUpdateQuery, [id]);
			return result.affectedRows > 0;
		});
	} catch (error: unknown) {
		return rethrowDatabaseError(error);
	}
};
