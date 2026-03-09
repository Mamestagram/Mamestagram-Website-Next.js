import fs from "fs";

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
}

const getIpAddress = async () => {
	const res = await fetch(`${process.env.BASE_URL}/api/get-ip`);
	return await res.json() as { ip: string };
}

const writeFile = (dirPath: string, filePath: string, data: string) => {
	fs.appendFile(filePath, data, (err) => {
		if (err !== null) {
			if (err.code === "ENOENT") {
				fs.mkdirSync(dirPath);
				writeFile(dirPath, filePath, data);
			}
			else {
				writeError(err).then(() => { throw err; });
			}
		}
	});
}

export const writeLog = async (method: "GET" | "POST", pathname: string) => {
	const date = getDate();
	const { ip } = await getIpAddress();
	const logDirPath = `${process.env.LOG_DIR}/${date.year}.${date.month}`,
		logFilePath = `${logDirPath}/${date.month}-${date.day}.log`,
		logData = `[${date.datetime}] ${method} ${pathname} (${ip})\n`;
	writeFile(logDirPath, logFilePath, logData);
}

export const writeError = async (err: unknown) => {
	const date = getDate();
	const { ip } = await getIpAddress();
	const errDirPath = `${process.env.ERR_DIR}/${date.year}.${date.month}`,
		errFilePath = `${errDirPath}/${date.month}-${date.day}.log`,
		errData = `[${date.datetime}] ERROR ${err} (${ip})\n`;
	writeFile(errDirPath, errFilePath, errData);
}