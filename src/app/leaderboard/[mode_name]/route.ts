import { NextRequest, NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { OsuMode } from "@/lib/mode";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ mode_name: string }> }) {
	const { mode_name } = await params;
	if (Object.values(OsuMode).includes(mode_name as OsuMode))
		return NextResponse.redirect(new URL(`/leaderboard/${mode_name}/performance`, process.env.BASE_URL));
	else
		notFound();
}