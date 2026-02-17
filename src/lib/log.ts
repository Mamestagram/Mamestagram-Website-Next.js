import fs from "fs";
import { NextRequest } from "next/server";

export const writeLog = (req: NextRequest) => {
	const datetime = new Date();
	const logDirPath = `./logs/${datetime.getFullYear()}${datetime.getMonth() + 1}`,
		logFilePath = `${logDirPath}/${String(datetime.getMonth() + 1).padStart(2, "0")}_${String(datetime.getDate()).padStart(2, "0")}.log`;
	const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "Unknown IP address";
	if (!fs.existsSync(logDirPath)) fs.mkdirSync(logDirPath);
	if (!req.nextUrl.pathname.includes("."))
		fs.appendFileSync(logFilePath, `[${datetime.toLocaleString("en-US", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
			timeZoneName: "longOffset"
		})}] ${req.method} ${req.nextUrl.pathname} (${ip})\n`);
}