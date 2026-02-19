import fs from "fs";
import { NextRequest } from "next/server";

export const writeLog = (req: NextRequest) => {
	const datetime = new Date();
	const year = datetime.getFullYear(),
		month = String(datetime.getMonth() + 1).padStart(2, "0"),
		day = String(datetime.getDate()).padStart(2, "0");
	const logDirPath = `./logs/${year}${month}`, logFilePath = `${logDirPath}/${month}-${day}.log`;
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