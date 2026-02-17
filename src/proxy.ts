import { NextRequest, NextResponse } from "next/server";
import { writeLog } from "@/lib/log";

// noinspection JSUnusedGlobalSymbols
export const proxy = async (req: NextRequest) => {
	writeLog(req);
	
	return NextResponse.next();
}

// noinspection JSUnusedGlobalSymbols
export const config = {
	matcher: ["/((?!_next).*)"]
};