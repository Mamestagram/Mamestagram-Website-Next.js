import "server-only";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const isFileExistsError = (error: unknown) =>
	typeof error === "object"
	&& error !== null
	&& "code" in error
	&& error.code === "EEXIST";

export const createEmptyUserLog = async (userId: number) => {
	if (!Number.isSafeInteger(userId) || userId <= 0)
		throw new Error("A valid user ID is required to create a user log.");

	const rootPath = process.env.USER_LOG_PATH?.trim();
	if (!rootPath) throw new Error("USER_LOG_PATH is not configured.");

	const filePath = path.join(rootPath, `${userId}.txt`);
	await mkdir(rootPath, { recursive: true });
	try {
		await writeFile(filePath, "", { flag: "wx" });
	}
	catch (error: unknown) {
		if (isFileExistsError(error) && (await stat(filePath)).size === 0) return;
		throw error;
	}
};
