import { NextRequest, NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { Mode } from "@/lib/mode";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ mode_name: string }> }) {
	const { mode_name } = await params;
	if (Object.values(Mode).includes(mode_name as Mode))
		return NextResponse.redirect(new URL(`/leaderboard/${mode_name}/performance`, process.env.BASE_URL));
	else
		notFound();
}