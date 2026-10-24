import { NextResponse } from "next/server";
import { getPlayerCounts } from "@/database/home";

export const GET = async () => {
	const counts = await getPlayerCounts();
	return NextResponse.json({ counts }, {
		status: counts ? 200 : 503,
		headers: { "Cache-Control": "no-store" }
	});
};
