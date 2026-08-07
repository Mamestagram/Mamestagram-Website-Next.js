import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import { fetchInternalJson } from "@/lib/fetch-json";

const UNKNOWN_IP = "Unknown IP address";

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
	if (!process.env.BASE_URL) return UNKNOWN_IP;

	const data = await fetchInternalJson<{ ip: string }>("/api/get_client_ip");
	return data.ip;
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

export const writeLog = async (method: "GET" | "POST", pathname: string) => {
	const date = getDate();
	const paths = getLogPaths(process.env.LOG_DIR, date.year, date.month, date.day);
	if (!paths) {
		console.error("LOG_DIR is not configured.");
		return;
	}

	const ip = await getIpAddress();
	await writeFile(paths.directory, paths.file, `[${date.datetime}] ${method} ${pathname} (${ip})\n`);
};

export const writeError = async (err: unknown) => {
	const date = getDate();
	const paths = getLogPaths(process.env.ERR_DIR, date.year, date.month, date.day);
	if (!paths) {
		console.error("ERR_DIR is not configured.", err);
		return;
	}

	const ip = await getIpAddress();
	const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
	await writeFile(paths.directory, paths.file, `[${date.datetime}] ERROR ${message} (${ip})\n`);
};
