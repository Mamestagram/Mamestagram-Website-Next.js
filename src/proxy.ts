import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ASSET_PATTERN = /\.(?:avif|css|gif|ico|jpe?g|png|svg|webp)$/i;
const NO_STORE = "private, no-cache, no-store, max-age=0, must-revalidate";
const REVALIDATE = "public, no-cache, max-age=0, must-revalidate";

const setLegacyNoCacheHeaders = (response: NextResponse) => {
	response.headers.set("Expires", "0");
	response.headers.set("Pragma", "no-cache");
};

// noinspection JSUnusedGlobalSymbols
export const proxy = async (request: NextRequest) => {
	const response = NextResponse.next();
	const { pathname } = request.nextUrl;
	if (pathname.startsWith("/api/profile-visual/")) return response;

	const cacheControl = PUBLIC_ASSET_PATTERN.test(pathname) ? REVALIDATE : NO_STORE;
	response.headers.set(
		"Cache-Control",
		cacheControl
	);
	response.headers.set("CDN-Cache-Control", cacheControl);
	setLegacyNoCacheHeaders(response);
	return response;
};

// noinspection JSUnusedGlobalSymbols
export const config = {
	matcher: ["/((?!_next).*)"]
};
