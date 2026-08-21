import type { NextRequest } from "next/server";

export const isSameOriginMutation = (request: NextRequest) => {
	const origin = request.headers.get("origin");
	if (!origin) return true;

	try {
		const forwardedHost = request.headers.get("x-forwarded-host")?.split(",").at(0)?.trim();
		const requestHost = forwardedHost || request.headers.get("host") || request.nextUrl.host;
		return new URL(origin).host === requestHost;
	}
	catch {
		return false;
	}
};
