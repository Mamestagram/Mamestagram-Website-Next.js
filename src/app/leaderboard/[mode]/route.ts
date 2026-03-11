import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ mode: string }> }) {
	const { mode } = await params;
	return NextResponse.redirect(new URL(`/leaderboard/${mode}/performance`, req.url));
}