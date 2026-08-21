import { type NextRequest, NextResponse } from "next/server";
import { getProfileCosmeticsMap } from "@/lib/profile-cosmetics";

const MAX_USER_IDS = 80;

export async function GET(request: NextRequest) {
	const ids = [...new Set((request.nextUrl.searchParams.get("ids") ?? "")
		.split(",")
		.map(Number)
		.filter((id) => Number.isSafeInteger(id) && id > 0))]
		.slice(0, MAX_USER_IDS);
	const cosmetics = await getProfileCosmeticsMap(ids);
	return NextResponse.json({ cosmetics: [...cosmetics.values()] });
}
