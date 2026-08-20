import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import { headers } from "next/headers";

const UNKNOWN_IP = "Unknown IP address";
const PRODUCTION_BUILD_PHASE = "phase-production-build";
const MAX_ERROR_DETAILS_LENGTH = 16_000;
const ERROR_DEDUPLICATION_MS = 5_000;

export type ErrorLogContext = {
	source?: "client" | "server",
	method?: string,
	pathname?: string,
	routePath?: string,
	routeType?: string,
	ipAddress?: string
};

const globalErrorHistory = globalThis as typeof globalThis & {
	mamestagramErrorHistory?: Map<string, number>
};
const errorHistory = globalErrorHistory.mamestagramErrorHistory ?? new Map<string, number>();
globalErrorHistory.mamestagramErrorHistory = errorHistory;

const isProductionBuild = () => process.env.NEXT_PHASE === PRODUCTION_BUILD_PHASE;

const escapeLogValue = (value: string) => Array.from(value, (character) => {
	const codePoint = character.codePointAt(0);
	if (codePoint === undefined || (codePoint > 31 && codePoint !== 127)) return character;
	return `\\u${codePoint.toString(16).padStart(4, "0")}`;
}).join("");

const getDate = () => {
	const datetime = new Date();
	return {
		year: datetime.getFullYear(),
		month: String(datetime.getMonth() + 1).padStart(2, "0"),
		day: String(datetime.getDate()).padStart(2, "0"),
		datetime: datetime.toLocaleString("en-US", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
			timeZoneName: "longOffset"
		})
	};
};

const getIpAddress = async () => {
	if (isProductionBuild()) return UNKNOWN_IP;

	try {
		const requestHeaders = await headers();
		const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",").at(0)?.trim();
		return forwardedFor || requestHeaders.get("x-real-ip")?.trim() || UNKNOWN_IP;
	}
	catch {
		return UNKNOWN_IP;
	}
};

const writeFile = async (dirPath: string, filePath: string, data: string) => {
	try {
		await mkdir(dirPath, { recursive: true });
		await appendFile(filePath, data);
	}
	catch (error: unknown) {
		console.error(`Failed to append log file: ${filePath}`, error);
	}
};

const getLogPaths = (root: string | undefined, year: number, month: string, day: string) => {
	if (!root) return null;
	const directory = `${root}/${year}.${month}`;
	return { directory, file: `${directory}/${month}-${day}.log` };
};

const getErrorDetails = (error: unknown) => {
	if (!(error instanceof Error)) return String(error);
	const digest = "digest" in error ? String(error.digest) : null;
	return [
		`${error.name}: ${error.message}`,
		digest ? `digest=${digest}` : null,
		error.stack
	].filter((value): value is string => Boolean(value)).join(" | ");
};

const getErrorContext = (context: ErrorLogContext) => {
	const values = [
		context.source ? `source=${context.source}` : null,
		context.method ? `method=${context.method}` : null,
		context.pathname ? `path=${context.pathname}` : null,
		context.routePath ? `route=${context.routePath}` : null,
		context.routeType ? `type=${context.routeType}` : null
	].filter((value): value is string => Boolean(value));
	return values.length > 0 ? `[${values.join(" ")}] ` : "";
};

export const writeLog = async (method: "GET" | "POST", pathname: string) => {
	if (isProductionBuild()) return;
	const date = getDate();
	const paths = getLogPaths(process.env.LOG_DIR, date.year, date.month, date.day);
	if (!paths) {
		console.error("LOG_DIR is not configured.");
		return;
	}

	const ip = await getIpAddress();
	await writeFile(paths.directory, paths.file, `[${date.datetime}] ${method} ${escapeLogValue(pathname)} (${ip})\n`);
};

export const writeError = async (error: unknown, context: ErrorLogContext = {}) => {
	const date = getDate();
	const paths = getLogPaths(process.env.ERR_DIR, date.year, date.month, date.day);
	if (!paths) {
		console.error("ERR_DIR is not configured.", error);
		return;
	}

	const details = getErrorDetails(error).slice(0, MAX_ERROR_DETAILS_LENGTH);
	const contextualDetails = `${getErrorContext(context)}${details}`;
	const now = Date.now();
	const lastWrittenAt = errorHistory.get(contextualDetails) ?? 0;
	if (now - lastWrittenAt < ERROR_DEDUPLICATION_MS) return;
	errorHistory.set(contextualDetails, now);
	if (errorHistory.size > 500) {
		for (const [key, writtenAt] of errorHistory) {
			if (now - writtenAt >= ERROR_DEDUPLICATION_MS) errorHistory.delete(key);
		}
	}

	const ip = context.ipAddress ?? await getIpAddress();
	const message = escapeLogValue(contextualDetails);
	await writeFile(paths.directory, paths.file, `[${date.datetime}] ERROR ${message} (${escapeLogValue(ip)})\n`);
};
