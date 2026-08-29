import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { executeQuery, withTransaction } from "@/database/connection";
import {
	badgeCatalogQuery,
	badgeOwnershipForUpdateQuery,
	badgeStateQuery,
	clanSettingsForUpdateQuery,
	clanSettingsTagConflictQuery,
	defaultUserSettingsQuery,
	legacyUserSettingsQuery,
	modernUserSettingsQuery,
	ownedClanSettingsQuery,
	profileSettingsNameConflictQuery,
	profileSettingsUserForUpdateQuery,
	settingsSchemaQuery,
	updateClanSettingsQuery,
	updateClanPrivacyQuery,
	updateClanProfileConfigurationQuery,
	updateDefaultProfileSettingsQuery,
	updateLegacyProfileSettingsQuery,
	updateModernProfileSettingsQuery,
	updateProfileConfigurationQuery,
	updateProfilePrivacyQuery,
	updateSelectedBadgeQuery,
	updateWebAppearanceQuery,
	userUseWebAppearanceQuery,
	userWebHueQuery,
	userWebThemeQuery,
	userProfileHueQuery,
	userProfileThemeQuery,
} from "@/database/query/settings";
import { makeSafeName } from "@/database/auth";
import { normalizeWebHue, normalizeWebTheme, type WebTheme } from "@/lib/theme";

type UserSettingsRow = RowDataPacket & {
	name: string;
	past_name: string | null;
	userpage_content: string | null;
	show_past_names: 0 | 1;
	is_private: 0 | 1;
};

type BadgeStateRow = RowDataPacket & {
	selected_badge: number;
	had_badge: string | null;
};

type SettingsSchemaRow = RowDataPacket & {
	badge_table_count: number;
	has_legacy_visibility: number;
	has_modern_visibility: number;
	has_web_theme: number;
	has_web_hue: number;
	has_profile_theme: number;
	has_profile_hue: number;
	has_use_web_appearance: number;
	has_clan_profile_theme: number;
	has_clan_profile_hue: number;
};

type WebThemeRow = RowDataPacket & {
	web_theme: number;
};

type WebHueRow = RowDataPacket & {
	web_hue: number | null;
};

type ProfileThemeRow = RowDataPacket & {
	profile_theme: number;
};

type ProfileHueRow = RowDataPacket & {
	profile_hue: number | null;
};

type UseWebAppearanceRow = RowDataPacket & {
	use_web_appearance: 0 | 1;
};

type BadgeCatalogRow = RowDataPacket & {
	badge_id: number;
	badge_name: string | null;
	prob: number | null;
};

type ProfileSettingsLockRow = RowDataPacket & {
	name: string;
	past_name: string | null;
};

type OwnedClanSettingsRow = RowDataPacket & {
	id: number;
	tag: string;
	past_tag: string | null;
	userpage_content: string | null;
	show_past_tags: 0 | 1;
	is_public: 0 | 1;
	profile_theme: number;
	profile_hue: number | null;
};

type ClanSettingsLockRow = RowDataPacket & {
	id: number;
	tag: string;
	past_tag: string | null;
};

type BadgeOwnershipRow = RowDataPacket & {
	had_badge: string | null;
};

export type SettingsBadge = {
	id: number;
	name: string;
	rarity: "common" | "rare" | "epic";
	isOwned: boolean;
};

export type UserSettings = {
	username: string;
	pastNames: string | null;
	aboutMe: string;
	showPastNames: boolean;
	isPrivate: boolean;
	webTheme: WebTheme;
	webHue: number | null;
	profileTheme: WebTheme;
	profileHue: number | null;
	useWebsiteAppearance: boolean;
	selectedBadge: number;
	badges: SettingsBadge[];
	canManageBadges: boolean;
};

export type OwnedClanSettings = {
	id: number;
	tag: string;
	pastTags: string | null;
	aboutMe: string;
	showPastTags: boolean;
	isPrivate: boolean;
	profileTheme: WebTheme;
	profileHue: number | null;
};

export type ProfileSettingsUpdateResult =
	| { success: true; username: string }
	| { success: false; reason: "conflict" | "missing" };

export type ClanSettingsUpdateResult =
	| { success: true; clanId: number; tag: string }
	| { success: false; reason: "conflict" | "missing" };

const parseBadgeIds = (value: string | null) =>
	new Set(
		(value ?? "")
			.split(",")
			.map((badgeId) => Number(badgeId.trim()))
			.filter((badgeId) => Number.isSafeInteger(badgeId) && badgeId > 0),
	);

const getBadgeRarity = (
	probability: number | null,
): SettingsBadge["rarity"] => {
	if ((probability ?? 0) >= 15) return "common";
	if ((probability ?? 0) >= 8) return "rare";
	return "epic";
};

type SettingsSchema = {
	canManageBadges: boolean;
	hasWebHue: boolean;
	hasWebTheme: boolean;
	hasProfileHue: boolean;
	hasProfileTheme: boolean;
	hasUseWebAppearance: boolean;
	hasClanProfileHue: boolean;
	hasClanProfileTheme: boolean;
	visibility: "legacy" | "modern" | "none";
};

let settingsSchemaPromise: Promise<SettingsSchema> | null = null;

const loadSettingsSchema = async (): Promise<SettingsSchema> => {
	const schema = (
		await executeQuery<SettingsSchemaRow>(settingsSchemaQuery)
	).at(0);
	return {
		canManageBadges: schema?.badge_table_count === 2,
		hasWebHue: schema?.has_web_hue === 1,
		hasWebTheme: schema?.has_web_theme === 1,
		hasProfileHue: schema?.has_profile_hue === 1,
		hasProfileTheme: schema?.has_profile_theme === 1,
		hasUseWebAppearance: schema?.has_use_web_appearance === 1,
		hasClanProfileHue: schema?.has_clan_profile_hue === 1,
		hasClanProfileTheme: schema?.has_clan_profile_theme === 1,
		visibility:
			schema?.has_legacy_visibility === 1
				? "legacy"
				: schema?.has_modern_visibility === 1
					? "modern"
					: "none",
	};
};

const getSettingsSchema = () => {
	settingsSchemaPromise ??= loadSettingsSchema().catch((error: unknown) => {
		settingsSchemaPromise = null;
		throw error;
	});
	return settingsSchemaPromise;
};

const MAX_PAST_NAMES = 3;

const appendPastName = (
	pastNames: string | null,
	previousName: string,
	nextName: string,
) => {
	if (previousName === nextName) return pastNames;
	
	const previousNameKey = previousName.toLocaleLowerCase();
	const nextNameKey = nextName.toLocaleLowerCase();
	const previousNames = (pastNames ?? "")
		.split(",")
		.map((name) => name.trim())
		.filter(Boolean)
		.filter((name) => {
			const nameKey = name.toLocaleLowerCase();
			return nameKey !== previousNameKey && nameKey !== nextNameKey;
		});
	previousNames.unshift(previousName);
	
	return previousNames.slice(0, MAX_PAST_NAMES).join(", ") || null;
};

export const getUserSettings = async (
	userId: number,
): Promise<UserSettings | null> => {
	const schema = await getSettingsSchema();
	const userQuery =
		schema.visibility === "legacy"
			? legacyUserSettingsQuery
			: schema.visibility === "modern"
				? modernUserSettingsQuery
				: defaultUserSettingsQuery;
	const users = await executeQuery<UserSettingsRow>(userQuery, [userId]);
	const user = users.at(0);
	if (!user) return null;
	const [
		badgeState,
		badgeCatalog,
		themeRows,
		hueRows,
		profileThemeRows,
		profileHueRows,
		useWebAppearanceRows,
	] = await Promise.all([
		schema.canManageBadges
			? executeQuery<BadgeStateRow>(badgeStateQuery, [userId])
			: Promise.resolve([]),
		schema.canManageBadges
			? executeQuery<BadgeCatalogRow>(badgeCatalogQuery)
			: Promise.resolve([]),
		schema.hasWebTheme
			? executeQuery<WebThemeRow>(userWebThemeQuery, [userId])
			: Promise.resolve([]),
		schema.hasWebHue
			? executeQuery<WebHueRow>(userWebHueQuery, [userId])
			: Promise.resolve([]),
		schema.hasProfileTheme
			? executeQuery<ProfileThemeRow>(userProfileThemeQuery, [userId])
			: Promise.resolve([]),
		schema.hasProfileHue
			? executeQuery<ProfileHueRow>(userProfileHueQuery, [userId])
			: Promise.resolve([]),
		schema.hasUseWebAppearance
			? executeQuery<UseWebAppearanceRow>(userUseWebAppearanceQuery, [userId])
			: Promise.resolve([]),
	]);
	const selectedBadge = badgeState.at(0)?.selected_badge ?? 0;
	const webTheme = normalizeWebTheme(themeRows.at(0)?.web_theme);
	const webHue = normalizeWebHue(hueRows.at(0)?.web_hue);
	const useWebsiteAppearance =
		useWebAppearanceRows.at(0)?.use_web_appearance === 1;
	
	const ownedBadgeIds = parseBadgeIds(badgeState.at(0)?.had_badge ?? null);
	return {
		username: user.name,
		pastNames: user.past_name,
		aboutMe: user.userpage_content ?? "",
		showPastNames: user.show_past_names === 1,
		isPrivate: user.is_private === 1,
		webTheme,
		webHue,
		profileTheme: useWebsiteAppearance
			? webTheme
			: normalizeWebTheme(profileThemeRows.at(0)?.profile_theme),
		profileHue: useWebsiteAppearance
			? webHue
			: normalizeWebHue(profileHueRows.at(0)?.profile_hue),
		useWebsiteAppearance,
		selectedBadge,
		canManageBadges: schema.canManageBadges,
		badges: badgeCatalog.map((badge) => ({
			id: badge.badge_id,
			name: badge.badge_name?.trim() || `Badge ${badge.badge_id}`,
			rarity: getBadgeRarity(badge.prob),
			isOwned:
				ownedBadgeIds.has(badge.badge_id) || selectedBadge === badge.badge_id,
		})),
	};
};

export const getOwnedClanSettings = async (
	ownerId: number,
): Promise<OwnedClanSettings | null> => {
	const clan = (
		await executeQuery<OwnedClanSettingsRow>(ownedClanSettingsQuery, [ownerId])
	).at(0);
	return clan
		? {
			id: clan.id,
			tag: clan.tag,
			pastTags: clan.past_tag,
			aboutMe: clan.userpage_content ?? "",
			showPastTags: clan.show_past_tags === 1,
			isPrivate: clan.is_public !== 1,
			profileTheme: normalizeWebTheme(clan.profile_theme),
			profileHue: normalizeWebHue(clan.profile_hue),
		}
		: null;
};

export const updateProfileSettings = async (
	userId: number,
	username: string,
	showPastNames: boolean,
): Promise<ProfileSettingsUpdateResult> => {
	const schema = await getSettingsSchema();
	return withTransaction(async (connection) => {
		const [users] = await connection.query<ProfileSettingsLockRow[]>(
			profileSettingsUserForUpdateQuery,
			[userId],
		);
		const currentUser = users.at(0);
		if (!currentUser) return { success: false, reason: "missing" };
		
		const safeName = makeSafeName(username);
		const [conflicts] = await connection.query<RowDataPacket[]>(
			profileSettingsNameConflictQuery,
			[safeName, userId],
		);
		if (conflicts.length > 0) return { success: false, reason: "conflict" };
		
		const pastNames = appendPastName(
			currentUser.past_name,
			currentUser.name,
			username,
		);
		if (schema.visibility === "none")
			await connection.query(updateDefaultProfileSettingsQuery, [
				username,
				safeName,
				pastNames,
				userId,
			]);
		else {
			const updateQuery =
				schema.visibility === "legacy"
					? updateLegacyProfileSettingsQuery
					: updateModernProfileSettingsQuery;
			await connection.query(updateQuery, [
				username,
				safeName,
				pastNames,
				showPastNames ? 1 : 0,
				userId,
			]);
		}
		return { success: true, username };
	});
};

export const updateClanSettings = async (
	ownerId: number,
	tag: string,
	showPastTags: boolean,
): Promise<ClanSettingsUpdateResult> =>
	withTransaction(async (connection) => {
		const [clans] = await connection.query<ClanSettingsLockRow[]>(
			clanSettingsForUpdateQuery,
			[ownerId],
		);
		const clan = clans.at(0);
		if (!clan) return { success: false, reason: "missing" };
		
		const [conflicts] = await connection.query<RowDataPacket[]>(
			clanSettingsTagConflictQuery,
			[tag, clan.id],
		);
		if (conflicts.length > 0) return { success: false, reason: "conflict" };
		
		const pastTags = appendPastName(clan.past_tag, clan.tag, tag);
		await connection.query(updateClanSettingsQuery, [
			tag,
			pastTags,
			showPastTags ? 1 : 0,
			clan.id,
			ownerId,
		]);
		return { success: true, clanId: clan.id, tag };
	});

export const updateProfilePrivacy = async (
	userId: number,
	isPrivate: boolean,
) =>
	withTransaction(async (connection) => {
		const [result] = await connection.query<ResultSetHeader>(
			updateProfilePrivacyQuery,
			[isPrivate ? 1 : 0, userId],
		);
		return result.affectedRows === 1;
	});

export const updateClanPrivacy = async (ownerId: number, isPrivate: boolean) =>
	withTransaction(async (connection) => {
		const [clans] = await connection.query<ClanSettingsLockRow[]>(
			clanSettingsForUpdateQuery,
			[ownerId],
		);
		const clan = clans.at(0);
		if (!clan) return null;
		
		const [result] = await connection.query<ResultSetHeader>(
			updateClanPrivacyQuery,
			[isPrivate ? 0 : 1, clan.id, ownerId],
		);
		return result.affectedRows === 1 ? clan.id : null;
	});

export const updateWebAppearance = async (
	userId: number,
	theme: WebTheme,
	hue: number | null,
) => {
	const schema = await getSettingsSchema();
	if (
		!schema.hasWebTheme ||
		!schema.hasWebHue ||
		!schema.hasProfileTheme ||
		!schema.hasProfileHue ||
		!schema.hasUseWebAppearance
	)
		throw new Error("The users appearance columns are not available");
	return withTransaction(async (connection) => {
		const [result] = await connection.query<ResultSetHeader>(
			updateWebAppearanceQuery,
			[theme, hue, theme, hue, userId],
		);
		return result.affectedRows === 1;
	});
};

export const updateProfileConfiguration = async (
	userId: number,
	isPrivate: boolean,
	theme: WebTheme,
	hue: number | null,
	useWebsiteAppearance: boolean,
) => {
	const schema = await getSettingsSchema();
	if (
		!schema.hasProfileTheme ||
		!schema.hasProfileHue ||
		!schema.hasUseWebAppearance
	)
		throw new Error("The users profile appearance columns are not available");
	return withTransaction(async (connection) => {
		const [result] = await connection.query<ResultSetHeader>(
			updateProfileConfigurationQuery,
			[
				isPrivate ? 1 : 0,
				useWebsiteAppearance ? 1 : 0,
				useWebsiteAppearance ? 1 : 0,
				theme,
				useWebsiteAppearance ? 1 : 0,
				hue,
				userId,
			],
		);
		return result.affectedRows === 1;
	});
};

export const updateClanProfileConfiguration = async (
	ownerId: number,
	isPrivate: boolean,
	theme: WebTheme,
	hue: number | null,
) => {
	const schema = await getSettingsSchema();
	if (!schema.hasClanProfileTheme || !schema.hasClanProfileHue)
		throw new Error("The clans profile appearance columns are not available");
	return withTransaction(async (connection) => {
		const [clans] = await connection.query<ClanSettingsLockRow[]>(
			clanSettingsForUpdateQuery,
			[ownerId],
		);
		const clan = clans.at(0);
		if (!clan) return null;
		
		const [result] = await connection.query<ResultSetHeader>(
			updateClanProfileConfigurationQuery,
			[isPrivate ? 0 : 1, theme, hue, clan.id, ownerId],
		);
		return result.affectedRows === 1 ? clan.id : null;
	});
};

export const getUserWebTheme = async (userId: number): Promise<WebTheme> => {
	if (!(await getSettingsSchema()).hasWebTheme)
		return normalizeWebTheme(undefined);
	const theme = (
		await executeQuery<WebThemeRow>(userWebThemeQuery, [userId])
	).at(0)?.web_theme;
	return normalizeWebTheme(theme);
};

export const getUserWebHue = async (userId: number): Promise<number | null> => {
	if (!(await getSettingsSchema()).hasWebHue) return null;
	const hue = (await executeQuery<WebHueRow>(userWebHueQuery, [userId])).at(
		0,
	)?.web_hue;
	return normalizeWebHue(hue);
};

export const updateSelectedBadge = async (userId: number, badgeId: number) => {
	if (!(await getSettingsSchema()).canManageBadges) return false;
	
	return withTransaction(async (connection) => {
		const [rows] = await connection.query<BadgeOwnershipRow[]>(
			badgeOwnershipForUpdateQuery,
			[userId],
		);
		const ownership = rows.at(0);
		if (!ownership) return false;
		
		if (badgeId !== 0 && !parseBadgeIds(ownership.had_badge).has(badgeId))
			return false;
		await connection.query(updateSelectedBadgeQuery, [badgeId, userId]);
		return true;
	});
};
