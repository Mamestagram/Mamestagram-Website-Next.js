import "server-only";

import { randomUUID } from "node:crypto";
import { access, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const PROFILE_MEDIA_TYPES = ["avatar", "banner", "background"] as const;
export type ProfileMediaType = typeof PROFILE_MEDIA_TYPES[number];
export type ProfileMediaScope = "profile" | "clan";

export const MAX_PROFILE_MEDIA_BYTES = 5 * 1024 * 1024;

export class ProfileMediaError extends Error {
	readonly status: number;

	constructor(message: string, status: number = 400) {
		super(message);
		this.name = "ProfileMediaError";
		this.status = status;
	}
}

export const isProfileMediaType = (value: string): value is ProfileMediaType =>
	PROFILE_MEDIA_TYPES.some((type) => type === value);

const getMediaRoot = (type: ProfileMediaType, scope: ProfileMediaScope) => {
	const root = scope === "clan"
		? {
			avatar: process.env.CLAN_AVATAR_PATH,
			banner: process.env.CLAN_BANNER_PATH,
			background: process.env.CLAN_BG_PATH
		}[type]
		: {
			avatar: process.env.AVATAR_PATH,
			banner: process.env.BANNER_PATH,
			background: process.env.BG_PATH
		}[type];
	if (!root) throw new ProfileMediaError("Profile media storage is not configured.", 503);
	return root;
};

const getMediaPath = (type: ProfileMediaType, profileId: number, scope: ProfileMediaScope) =>
	path.join(getMediaRoot(type, scope), String(profileId));

const hasBytes = (bytes: Uint8Array, expected: readonly number[], offset: number = 0) =>
	expected.every((value, index) => bytes.at(offset + index) === value);

const isSupportedImage = (bytes: Uint8Array) => {
	const isJpeg = hasBytes(bytes, [0xff, 0xd8, 0xff]);
	const isPng = hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
	const isGif = hasBytes(bytes, [0x47, 0x49, 0x46, 0x38]) &&
		(bytes.at(4) === 0x37 || bytes.at(4) === 0x39) && bytes.at(5) === 0x61;
	const isWebp = hasBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
		hasBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8);
	return isJpeg || isPng || isGif || isWebp;
};

export const profileMediaExists = async (
	type: ProfileMediaType,
	profileId: number,
	scope: ProfileMediaScope = "profile"
) => {
	try {
		await access(getMediaPath(type, profileId, scope));
		return true;
	}
	catch {
		return false;
	}
};

export const saveProfileMedia = async (
	type: ProfileMediaType,
	profileId: number,
	file: File,
	scope: ProfileMediaScope = "profile"
) => {
	if (file.size === 0) throw new ProfileMediaError("Choose an image to upload.");
	if (file.size > MAX_PROFILE_MEDIA_BYTES)
		throw new ProfileMediaError("The image must be 5 MB or smaller.");

	const bytes = new Uint8Array(await file.arrayBuffer());
	if (!isSupportedImage(bytes))
		throw new ProfileMediaError("Use a PNG, JPG, WebP, or GIF image.");

	const targetPath = getMediaPath(type, profileId, scope);
	const temporaryPath = path.join(path.dirname(targetPath), `.${profileId}.${randomUUID()}.tmp`);
	try {
		await writeFile(temporaryPath, bytes, { flag: "wx" });
		await rename(temporaryPath, targetPath);
	}
	catch (error: unknown) {
		await unlink(temporaryPath).catch(() => undefined);
		if (error instanceof ProfileMediaError) throw error;
		throw new ProfileMediaError("The image could not be saved.", 503);
	}
};

export const removeProfileMedia = async (
	type: ProfileMediaType,
	profileId: number,
	scope: ProfileMediaScope = "profile"
) => {
	try {
		await unlink(getMediaPath(type, profileId, scope));
	}
	catch (error: unknown) {
		if (error instanceof Error && "code" in error && error.code === "ENOENT") return;
		throw new ProfileMediaError("The image could not be reset.", 503);
	}
};
