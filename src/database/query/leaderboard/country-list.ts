import { Priv } from "@/lib/priv";

export const countryList = `
	SELECT DISTINCT(country) AS country
		FROM users
	WHERE NOT (priv & ${Priv.unrestricted}) > 0
	ORDER BY country;
`;