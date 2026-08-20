import "server-only";
import { cache } from "react";
import { writeError } from "@/lib/log";

export type ProfileBadge = {
	id: number,
	name: string,
	source: string,
	iconUrl: string
};

export type AvatarFramePlacement = {
	leftPercent: number,
	topPercent: number,
	widthPercent: number,
	heightPercent: number,
	avatarSizePercent: number
};

export type ProfileFrame = {
	id: number,
	name: string,
	source: string,
	creatorId: number | null,
	imageUrl: string,
	itemUrl: string,
	placement: AvatarFramePlacement
};

export type ProfileCosmetics = {
	userId: number,
	badge: ProfileBadge | null,
	frame: ProfileFrame | null
};

type ProfileCosmeticsApi = {
	status: string,
	user_id?: number,
	profile_badge_is_set?: boolean,
	avatar_frame_is_set?: boolean,
	badge?: {
		id?: number,
		name?: string,
		source?: string,
		icon_url?: string
	} | null,
	profile_frame?: {
		id?: number,
		name?: string,
		source?: string,
		creator_id?: number | null,
		image_url?: string,
		item_url?: string,
		placement?: {
			left_percent?: number,
			top_percent?: number,
			width_percent?: number,
			height_percent?: number,
			avatar_size_percent?: number
		}
	} | null
};

const emptyCosmetics = (userId: number): ProfileCosmetics => ({ userId, badge: null, frame: null });
const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const isPositiveSafeInteger = (value: unknown): value is number =>
	typeof value === "number" && Number.isSafeInteger(value) && value > 0;

const normalizeCosmetics = (userId: number, data: ProfileCosmeticsApi): ProfileCosmetics => {
	const badge = data.badge;
	const frame = data.profile_frame;
	const placement = frame?.placement;
	const badgeId = badge?.id;
	const frameId = frame?.id;

	return {
		userId,
		badge: data.profile_badge_is_set === true && badge && isPositiveSafeInteger(badgeId) && badge.icon_url
			? {
				id: badgeId,
				name: badge.name ?? `Badge ${badgeId}`,
				source: badge.source ?? "unknown",
				iconUrl: badge.icon_url
			}
			: null,
		frame: data.avatar_frame_is_set === true && frame && placement && isPositiveSafeInteger(frameId) && frame.image_url
			&& isFiniteNumber(placement.left_percent)
			&& isFiniteNumber(placement.top_percent)
			&& isFiniteNumber(placement.width_percent)
			&& isFiniteNumber(placement.height_percent)
			&& isFiniteNumber(placement.avatar_size_percent)
			? {
				id: frameId,
				name: frame.name ?? `Frame ${frameId}`,
				source: frame.source ?? "unknown",
				creatorId: frame.creator_id ?? null,
				imageUrl: frame.image_url,
				itemUrl: frame.item_url ?? "",
				placement: {
					leftPercent: placement.left_percent,
					topPercent: placement.top_percent,
					widthPercent: placement.width_percent,
					heightPercent: placement.height_percent,
					avatarSizePercent: placement.avatar_size_percent
				}
			}
			: null
	};
};

export const getProfileCosmetics = cache(async (userId: number): Promise<ProfileCosmetics> => {
	if (!Number.isSafeInteger(userId) || userId < 1) return emptyCosmetics(userId);
	const baseDomain = process.env.BASE_DOMAIN;
	if (!baseDomain) {
		void writeError(new Error("BASE_DOMAIN is not configured"));
		return emptyCosmetics(userId);
	}

	try {
		const url = new URL("/v1/get_profile_cosmetics", `https://api.${baseDomain}`);
		url.searchParams.set("userid", userId.toString());
		const response = await fetch(url, {
			cache: "no-store",
			headers: { Accept: "application/json" }
		});
		if (!response.ok) {
			void writeError(new Error(`Profile cosmetics API request failed (${response.status})`));
			return emptyCosmetics(userId);
		}
		const data = await response.json() as ProfileCosmeticsApi;
		return data.status === "success" && data.user_id === userId
			? normalizeCosmetics(userId, data)
			: emptyCosmetics(userId);
	}
	catch (error: unknown) {
		void writeError(error);
		return emptyCosmetics(userId);
	}
});

export const getProfileCosmeticsMap = async (userIds: number[]) => {
	const uniqueIds = [...new Set(userIds.filter((id) => Number.isSafeInteger(id) && id > 0))];
	const cosmetics = new Map<number, ProfileCosmetics>();
	const concurrency = 24;
	for (let index = 0; index < uniqueIds.length; index += concurrency) {
		const batch = await Promise.all(uniqueIds.slice(index, index + concurrency).map(getProfileCosmetics));
		batch.forEach((item) => cosmetics.set(item.userId, item));
	}
	return cosmetics;
};
