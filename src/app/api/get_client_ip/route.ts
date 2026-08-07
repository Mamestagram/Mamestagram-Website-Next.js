import { NextResponse, type NextRequest } from "next/server";

export function GET(req: NextRequest) {
	const ip =
		req.headers.get("x-forwarded-for") ??
		req.headers.get("x-real-ip") ??
		"Unknown IP address";
	return NextResponse.json({ ip });
}
