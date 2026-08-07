import { NextResponse } from "next/server";

// noinspection JSUnusedGlobalSymbols
export const proxy = async () => {
	return NextResponse.next();
}

// noinspection JSUnusedGlobalSymbols
export const config = {
	matcher: ["/((?!_next).*)"]
};
