import { NextRequest, NextResponse } from "next/server";

// noinspection JSUnusedGlobalSymbols
export const proxy = async (req: NextRequest) => {
	return NextResponse.next();
}

// noinspection JSUnusedGlobalSymbols
export const config = {
	matcher: ["/((?!_next).*)"]
};