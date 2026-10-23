type MedalOrder = readonly (readonly [expression: string, direction?: "DESC"])[];

// Extract the category without lookbehind so the same order also supports all modes together.
export const getSkillMedalOrder = (modeName: string): MedalOrder => {
	const skill = `SUBSTRING_INDEX(REGEXP_SUBSTR(file, '^${modeName}-skill-[a-z]+'), '-', -1)`;
	const category = `SUBSTRING_INDEX(REGEXP_SUBSTR(file, '^${modeName}-[a-z]+'), '-', -1)`;
	const conditionNumber = "CAST(REGEXP_SUBSTR(REPLACE(cond_desc, ',', ''), '[0-9]+') AS UNSIGNED)";
	return [
		[`${skill} NOT IN ('pass', 'fc', 'dans')`, "DESC"],
		[`${skill} = 'pass'`, "DESC"],
		[`${skill} = 'fc'`, "DESC"],
		[`${skill} = 'dans'`, "DESC"],
		["file LIKE '%hide-%'"],
		["file LIKE 'skill-%'"],
		[`REGEXP_SUBSTR(file, '^${modeName}-[a-z]+-')`],
		["CAST(REGEXP_SUBSTR(file, '[0-9]+$') AS UNSIGNED)"],
		[`CASE WHEN NOT ${category} = 'rank' THEN ${conditionNumber} END`],
		[`CASE WHEN ${category} = 'rank' THEN ${conditionNumber} END`, "DESC"],
		["id"],
	];
};

export const medalModOrder: MedalOrder = [["id"]];

export const medalOthersOrder: MedalOrder = [
	["file LIKE '%hide-%'"],
	["REGEXP_SUBSTR(file, '^[a-z]+-')"],
	["CAST(REGEXP_SUBSTR(REPLACE(cond_desc, ',', ''), '[0-9]+') AS UNSIGNED)"],
	["id"],
];

export const medalOrderQuery = (order: MedalOrder, condition?: string) => order.map(([expression, direction]) =>
	`${condition ? `CASE WHEN ${condition} THEN ${expression} END` : expression}${direction ? ` ${direction}` : ""}`,
).join(",\n\t\t");
