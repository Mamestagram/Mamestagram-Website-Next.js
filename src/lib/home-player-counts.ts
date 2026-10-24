import type { HomePlayerCounts } from "@/database/home";

export const isHomePlayerCounts = (value: unknown): value is HomePlayerCounts => {
	if (typeof value !== "object" || value === null) return false;
	return (["online", "total", "stable", "lazer"] as const).every((key) => {
		const count = (value as Record<string, unknown>)[key];
		return typeof count === "number" && Number.isSafeInteger(count) && count >= 0;
	});
};
