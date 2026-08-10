import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readdir, rename, unlink, writeFile } from "node:fs/promises";
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

	if (!root)
		throw new ProfileMediaError("Profile media storage is not configured.", 503);
	return root;
};

const getMediaPath = (
	type: ProfileMediaType,
	profileId: number,
	scope: ProfileMediaScope,
	extension: string
) => path.join(getMediaRoot(type, scope), `${profileId}.${extension}`);

const getExistingMediaPaths = async (
	type: ProfileMediaType,
	profileId: number,
	scope: ProfileMediaScope
) => {
	const root = getMediaRoot(type, scope);
	const expectedName = String(profileId);
	const entries = await readdir(root, { withFileTypes: true });
	return entries
		.filter((entry) => entry.isFile() && entry.name.split(".", 1)[0] === expectedName)
		.map((entry) => path.join(root, entry.name));
};

const hasBytes = (bytes: Uint8Array, expected: readonly number[], offset: number = 0) =>
	expected.every((value, index) => bytes.at(offset + index) === value);

type ProfileImageFormat = "gif" | "jpeg" | "png" | "webp";

const getImageFormat = (bytes: Uint8Array): ProfileImageFormat | null => {
	if (hasBytes(bytes, [0xff, 0xd8, 0xff])) return "jpeg";
	if (hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
		return "png";
	if (hasBytes(bytes, [0x47, 0x49, 0x46, 0x38]) &&
		(bytes.at(4) === 0x37 || bytes.at(4) === 0x39) && bytes.at(5) === 0x61)
		return "gif";
	if (hasBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
		hasBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8))
		return "webp";
	return null;
};

const getOriginalExtension = (file: File, format: ProfileImageFormat) => {
	const extension = path.extname(file.name).slice(1).toLowerCase();
	const validExtensions: Record<ProfileImageFormat, readonly string[]> = {
		gif: ["gif"],
		jpeg: ["jpg", "jpeg"],
		png: ["png"],
		webp: ["webp"]
	};
	return validExtensions[format].includes(extension) ? extension : null;
};

export const profileMediaExists = async (
	type: ProfileMediaType,
	profileId: number,
	scope: ProfileMediaScope = "profile"
) => {
	try {
		return (await getExistingMediaPaths(type, profileId, scope)).length > 0;
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
	const format = getImageFormat(bytes);
	if (!format)
		throw new ProfileMediaError("Use a PNG, JPG, WebP, or GIF image.");
	const extension = getOriginalExtension(file, format);
	if (!extension)
		throw new ProfileMediaError("The file extension does not match the image format.");

	const targetPath = getMediaPath(type, profileId, scope, extension);
	const targetDirectory = path.dirname(targetPath);
	const temporaryPath = path.join(
		targetDirectory,
		`.${profileId}.${randomUUID()}.tmp`
	);
	try {
		await mkdir(targetDirectory, { recursive: true });
		await writeFile(temporaryPath, bytes, { flag: "wx" });
		await rename(temporaryPath, targetPath);
		const obsoletePaths = (await getExistingMediaPaths(type, profileId, scope))
			.filter((mediaPath) => mediaPath !== targetPath);
		await Promise.all(obsoletePaths.map((mediaPath) => unlink(mediaPath)));
	}
	catch {
		await unlink(temporaryPath).catch(() => undefined);
		throw new ProfileMediaError("The image could not be saved.", 503);
	}
};

export const removeProfileMedia = async (
	type: ProfileMediaType,
	profileId: number,
	scope: ProfileMediaScope = "profile"
) => {
	try {
		const mediaPaths = await getExistingMediaPaths(type, profileId, scope);
		await Promise.all(mediaPaths.map((mediaPath) => unlink(mediaPath)));
	}
	catch (error: unknown) {
		if (error instanceof Error && "code" in error && error.code === "ENOENT") return;
		throw new ProfileMediaError("The image could not be reset.", 503);
	}
};
