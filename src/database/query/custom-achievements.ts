import { getSkillMedalOrder, medalModOrder, medalOthersOrder, medalOrderQuery } from "@/database/query/profile/achievement-order";

const skillMedalCondition = "file REGEXP '^(osu|taiko|fruits|mania|skill)-'";
const modMedalCondition = "file LIKE 'all-%'";
const otherMedalCondition = `NOT (${skillMedalCondition}) AND NOT (${modMedalCondition})`;

export const customAchievementsQuery = `
	SELECT c.slot, a.id, a.file AS filename, a.name, a.\`desc\` AS description, a.cond_desc AS condDescription
	FROM web_custom_achievements c
	INNER JOIN achievements a ON a.id = c.achid
	WHERE c.userid = ? AND c.slot BETWEEN 1 AND 8 AND EXISTS (
		SELECT 1 FROM user_achievements ua WHERE ua.userid = c.userid AND ua.achid = a.id
	)
	ORDER BY c.slot, c.achid
	LIMIT 8
`;

export const ownedCustomAchievementsQuery = `
	SELECT a.id, a.file AS filename, a.name, a.\`desc\` AS description, a.cond_desc AS condDescription
	FROM achievements a
	WHERE EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.userid = ? AND ua.achid = a.id)
	ORDER BY CASE WHEN ${skillMedalCondition} THEN 0 WHEN ${modMedalCondition} THEN 1 ELSE 2 END,
		${medalOrderQuery(getSkillMedalOrder("(osu|taiko|fruits|mania)"), skillMedalCondition)},
		${medalOrderQuery(medalModOrder, modMedalCondition)},
		${medalOrderQuery(medalOthersOrder, otherMedalCondition)}
`;

export const validateCustomAchievementsQuery = `
	SELECT a.id FROM achievements a
	WHERE a.id IN (?) AND EXISTS (
		SELECT 1 FROM user_achievements ua WHERE ua.userid = ? AND ua.achid = a.id
	)
`;

export const deleteCustomAchievementsQuery = `DELETE FROM web_custom_achievements WHERE userid = ?`;
export const insertCustomAchievementsQuery = `INSERT INTO web_custom_achievements (userid, achid, slot) VALUES ?`;

export const customAchievementsUserForUpdateQuery = `SELECT id FROM users WHERE id = ? LIMIT 1 FOR UPDATE`;
