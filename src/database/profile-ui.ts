import type { CustomAchievementIds } from "@/lib/custom-achievements";
import { saveCustomAchievements } from "@/database/custom-achievements";
import type { RowDataPacket } from "mysql2/promise";
import { executeQuery, withTransaction } from "@/database/connection";
import {
	clearProfileUiQuery,
	profileUiQuery,
	profileUiUserForUpdateQuery,
	updateProfileUiQuery,
} from "@/database/query/profile-ui";
import { deleteDefaultAppearanceSettingsQuery } from "@/database/query/settings";
import {
	getDefaultProfileUi,
	isDefaultProfileUi,
	parseProfileUiContents,
	parseProfileUiDocument,
	type ProfileUiItem,
} from "@/lib/profile-ui";

type ProfileUiRow = RowDataPacket & {
	profile_ui: unknown;
};

type ProfileUiUserRow = RowDataPacket & {
	id: number;
};

export const getProfileUi = async (userId: number): Promise<ProfileUiItem[]> => {
	const rows = await executeQuery<ProfileUiRow>(profileUiQuery, [userId]);
	const contents = parseProfileUiDocument(rows.at(0)?.profile_ui);
	if (!contents) return getDefaultProfileUi();
	return contents.map((content) => ({ ...content, customized: true }));
};

export const saveProfileUi = async (
	userId: number,
	contents: ProfileUiItem[],
	achievementIds?: CustomAchievementIds,
) => {
	const parsedContents = parseProfileUiContents(contents);
	if (!parsedContents) throw new Error("The profile UI layout is invalid.");
	return withTransaction(async (connection) => {
		const [users] = await connection.query<ProfileUiUserRow[]>(
			profileUiUserForUpdateQuery,
			[userId],
		);
		if (users.length === 0) throw new Error("The profile user does not exist.");
		if (achievementIds !== undefined) await saveCustomAchievements(connection, userId, achievementIds);
		if (isDefaultProfileUi(parsedContents)) {
			await connection.query(clearProfileUiQuery, [userId]);
			await connection.query(deleteDefaultAppearanceSettingsQuery, [userId]);
			return;
		}
		const layout = JSON.stringify({ version: 2, contents: parsedContents });
		await connection.query(updateProfileUiQuery, [userId, layout, layout]);
	});
};
