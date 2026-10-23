import { ModeNum } from "@/lib/mode";
import { getSkillMedalOrder, medalModOrder, medalOthersOrder, medalOrderQuery } from "@/database/query/profile/achievement-order";

export const medalSkillQuery = (mode: ModeNum) => {
	let modeName: "osu" | "taiko" | "fruits" | "mania";
	switch (mode) {
		case ModeNum.std:
		case ModeNum.rxstd:
		case ModeNum.apstd:
			modeName = "osu";
			break;
		case ModeNum.taiko:
		case ModeNum.rxtaiko:
			modeName = "taiko";
			break;
		case ModeNum.ctb:
		case ModeNum.rxctb:
			modeName = "fruits";
			break;
		case ModeNum.mania:
			modeName = "mania";
			break;
	}
	return `
        SELECT id,
		       file AS filename,
		       name,
		       \`desc\` AS description,
		       cond_desc AS condDescription,
               EXISTS(
                   SELECT *
                	   FROM user_achievements
                   WHERE userid = ?
                	   AND achid = id
               ) AS isCollected
		    FROM achievements
		WHERE file LIKE '${modeName}-%' -- modeName = osu, taiko, fruits, mania
		    OR file LIKE 'skill-%'
		ORDER BY ${medalOrderQuery(getSkillMedalOrder(modeName))}
	`;
}

export const medalModQuery = `
    SELECT id,
           file AS filename,
           name,
           \`desc\` AS description,
           cond_desc AS condDescription,
           EXISTS(
               SELECT *
               	   FROM user_achievements
               WHERE userid = ?
                   AND achid = id
           ) AS isCollected
    	FROM achievements
    WHERE file LIKE 'all-%'
    ORDER BY ${medalOrderQuery(medalModOrder)}
`;

export const medalOthersQuery = `
    SELECT id,
           file AS filename,
           name,
           \`desc\` AS description,
           cond_desc AS condDescription,
           EXISTS(
               SELECT *
               	   FROM user_achievements
               WHERE userid = ?
            	   AND achid = id
           ) AS isCollected
    FROM achievements
    WHERE NOT file LIKE 'osu-%'
		AND NOT file LIKE 'taiko-%'
		AND NOT file LIKE 'fruits-%'
		AND NOT file LIKE 'mania-%'
		AND NOT file LIKE 'skill-%'
		AND NOT file LIKE 'all-%'
    ORDER BY ${medalOrderQuery(medalOthersOrder)}
`;
