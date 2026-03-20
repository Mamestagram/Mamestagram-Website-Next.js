import { NextResponse } from "next/server";

export function GET() {
	return NextResponse.redirect(new URL("/leaderboard/std/performance", process.env.BASE_URL));
}