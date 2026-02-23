import { NextRequest, NextResponse } from "next/server";
import { writeLog } from "@/lib/log";

// noinspection JSUnusedGlobalSymbols
export const proxy = async (req: NextRequest) => {
	writeLog(req);
	const res = NextResponse.next();
	if (!req.nextUrl.pathname.includes("."))
		res.cookies.set("sub-domain", req.nextUrl.pathname.split("/").at(1) || "home");
	return res;
}

// noinspection JSUnusedGlobalSymbols
export const config = {
	matcher: ["/((?!_next).*)"]
};