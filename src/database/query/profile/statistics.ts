import { ModeNum } from "@/lib/mode";

export const medalCountQuery = `
	SELECT COUNT(*) AS value
	    FROM user_achievements
	WHERE userid = ? -- number
`;

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
        SELECT userid AS userId,
               file AS filename,
               name,
               \`desc\` AS description,
               cond_desc AS condDescription
        	FROM achievements
		LEFT JOIN user_achievements
			ON id = achid
        WHERE (file LIKE '${modeName}-%'
			OR file LIKE 'skill-%')
			AND userid = ? -- number
        ORDER BY REGEXP_SUBSTR(file, '(?<=^${modeName}-skill-)[a-z]+(?=-)') NOT IN ('pass', 'fc', 'dans') DESC,
			REGEXP_SUBSTR(file, '(?<=^${modeName}-skill-)[a-z]+(?=-)') = 'pass' DESC,
			REGEXP_SUBSTR(file, '(?<=^${modeName}-skill-)[a-z]+(?=-)') = 'fc' DESC,
			REGEXP_SUBSTR(file, '(?<=^${modeName}-skill-)[a-z]+(?=-)') = 'dans' DESC,
			file like '%hide-%',
			file LIKE 'skill-%',
			REGEXP_SUBSTR(file, '^${modeName}-[a-z]+-'),
			CAST(REGEXP_SUBSTR(file, '[0-9]+$') AS UNSIGNED),
			CASE
				WHEN NOT REGEXP_SUBSTR(file, '(?<=^${modeName}-)[a-z]+(?=-)') = 'rank' THEN CAST(REGEXP_SUBSTR(REPLACE(cond_desc, ',', ''), '[0-9]+') AS UNSIGNED)
			END,
			CASE
				WHEN REGEXP_SUBSTR(file, '(?<=^${modeName}-)[a-z]+(?=-)') = 'rank' THEN CAST(REGEXP_SUBSTR(REPLACE(cond_desc, ',', ''), '[0-9]+') AS UNSIGNED)
			END DESC,
			id
	`;
}

export const medalModQuery = `
    SELECT userid AS userId,
           file AS filename,
           name,
           \`desc\` AS description,
           cond_desc AS condDescription
	    FROM achievements
	LEFT JOIN user_achievements
		ON id = achid
    WHERE file LIKE 'all-%'
		AND userid = ? -- number
    ORDER BY id
`;

export const medalOthersQuery = `
    SELECT userid AS userId,
           file AS filename,
           name,
           \`desc\` AS description,
           cond_desc AS condDescription
	    FROM achievements
	LEFT JOIN user_achievements
		ON id = achid
    WHERE NOT file LIKE 'osu-%'
		AND NOT file LIKE 'taiko-%'
		AND NOT file LIKE 'fruits-%'
		AND NOT file LIKE 'mania-%'
		AND NOT file LIKE 'skill-%'
		AND NOT file LIKE 'all-%'
		AND userid = ? -- number
    ORDER BY file LIKE '%hide-%',
		REGEXP_SUBSTR(file, '^[a-z]+-'),
		CAST(REGEXP_SUBSTR(REPLACE(cond_desc, ',', ''), '[0-9]+') AS UNSIGNED),
		id
`;