import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { executeQuery, withTransaction } from "@/database/connection";
import {
	customAchievementsQuery, ownedCustomAchievementsQuery, validateCustomAchievementsQuery,
	deleteCustomAchievementsQuery, insertCustomAchievementsQuery,
	customAchievementsUserForUpdateQuery,
} from "@/database/query/custom-achievements";
import { MAX_CUSTOM_ACHIEVEMENTS, parseCustomAchievementIds, type CustomAchievement, type CustomAchievementIds, type CustomAchievementSelection, type CustomAchievementSettings } from "@/lib/custom-achievements";

type AchievementRow = RowDataPacket & CustomAchievement;

export class InvalidCustomAchievementsError extends Error {}

export const getCustomAchievements = async (userId: number): Promise<CustomAchievementSelection> => {
	const rows = await executeQuery<AchievementRow & { slot: number }>(customAchievementsQuery, [userId]);
	const slots: CustomAchievementSelection = Array.from({ length: MAX_CUSTOM_ACHIEVEMENTS }, () => null);
	const selected = new Set<number>();
	for (const { slot, id, filename, name, description, condDescription } of rows) {
		if (!Number.isInteger(slot) || slot < 1 || slot > MAX_CUSTOM_ACHIEVEMENTS || slots[slot - 1] || selected.has(id)) continue;
		slots[slot - 1] = { id, filename, name, description, condDescription };
		selected.add(id);
	}
	return slots;
};

export const getCustomAchievementSettings = async (userId: number): Promise<CustomAchievementSettings> => {
	const [achievements, selected] = await Promise.all([
		executeQuery<AchievementRow>(ownedCustomAchievementsQuery, [userId]),
		getCustomAchievements(userId),
	]);
	return { achievements, selectedIds: selected.map((achievement) => achievement?.id ?? null) };
};

export const saveCustomAchievements = async (connection: PoolConnection, userId: number, ids: CustomAchievementIds) => {
	const slots = parseCustomAchievementIds(ids);
	if (!slots) throw new InvalidCustomAchievementsError("Select up to 8 different achievements.");
	const selected = slots.filter((id): id is number => id !== null);
	if (selected.length > 0) {
		const [owned] = await connection.query<(RowDataPacket & { id: number })[]>(validateCustomAchievementsQuery, [selected, userId]);
		if (owned.length !== selected.length) throw new InvalidCustomAchievementsError("Only earned achievements can be displayed.");
	}
	await connection.query(deleteCustomAchievementsQuery, [userId]);
	if (selected.length > 0) await connection.query(insertCustomAchievementsQuery,
		[slots.flatMap((id, index) => id === null ? [] : [[userId, id, index + 1]])]);
};

export const updateCustomAchievements = (userId: number, ids: CustomAchievementIds) => withTransaction(async (connection) => {
	// Serialize with the layout editor's save for the same profile.
	const [users] = await connection.query<RowDataPacket[]>(customAchievementsUserForUpdateQuery, [userId]);
	if (users.length === 0) throw new Error("The profile user does not exist.");
	await saveCustomAchievements(connection, userId, ids);
});
