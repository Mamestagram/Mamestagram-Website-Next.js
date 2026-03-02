import fs from "fs";
import { NextRequest } from "next/server";

const writeFile = (dirPath: string, filePath: string, data: string) => {
	fs.appendFile(filePath, data, (err) => {
		if (err !== null) {
			if (err.code === "ENOENT") {
				fs.mkdirSync(dirPath);
				writeFile(dirPath, filePath, data);
			}
			else {
				console.error(err);
				throw err;
			}
		}
	});
}

export const writeLog = (req: NextRequest) => {
	const pathname = req.nextUrl.searchParams.get("path");
	const datetime = new Date();
	const year = datetime.getFullYear(),
		month = String(datetime.getMonth() + 1).padStart(2, "0"),
		day = String(datetime.getDate()).padStart(2, "0");
	const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "Unknown IP address";
	const logDirPath = `${process.env.LOG_DIR}/${year}${month}`,
		logFilePath = `${logDirPath}/${month}-${day}.log`,
		logData = `[${datetime.toLocaleString("en-US", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
			timeZoneName: "longOffset"
		})}] ${req.method} ${pathname} (${ip})\n`;
	if (!req.nextUrl.pathname.includes("."))
		writeFile(logDirPath, logFilePath, logData);
}

export const writeError = (req: NextRequest) => {

}