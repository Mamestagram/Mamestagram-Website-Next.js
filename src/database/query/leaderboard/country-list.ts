import { Priv } from "@/lib/priv";

export const countryListQuery = `
	SELECT DISTINCT(country) AS country
		FROM users
	WHERE (priv & ${Priv.unrestricted}) > 0
	ORDER BY country;
`;
