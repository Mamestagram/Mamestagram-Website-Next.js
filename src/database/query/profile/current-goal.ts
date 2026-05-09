export const currentGoalQuery = (category: "pp" | "acc" | "score"): Readonly<string> => {
	return `
        SELECT name, category, val
        	FROM goal
        WHERE userid = ? -- number
        	AND category = '${category}'
	`;
}