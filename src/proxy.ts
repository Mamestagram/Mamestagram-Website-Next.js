import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ASSET_PATTERN = /\.(?:avif|css|gif|ico|jpe?g|png|svg|webp)$/i;
const NO_STORE = "private, no-cache, no-store, max-age=0, must-revalidate";
const REVALIDATE = "public, no-cache, max-age=0, must-revalidate";

const isLocalHostname = (hostname: string) =>
	hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";

const getRequestHostname = (request: NextRequest) => {
	const host = request.headers.get("host")?.trim();
	if (!host) return request.nextUrl.hostname;
	try {
		return new URL(`http://${host}`).hostname;
	} catch {
		return request.nextUrl.hostname;
	}
};

const getRequestProtocol = (request: NextRequest) =>
	request.headers.get("x-forwarded-proto")?.split(",").at(0)?.trim().toLowerCase()
	?? request.nextUrl.protocol.replace(":", "").toLowerCase();

const shouldRedirectToHttps = (request: NextRequest) =>
	process.env.NODE_ENV === "production"
	&& Boolean(process.env.BASE_URL)
	&& !isLocalHostname(getRequestHostname(request))
	&& getRequestProtocol(request) !== "https";

const getSecureUrl = (request: NextRequest) => {
	const secureUrl = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, process.env.BASE_URL);
	secureUrl.protocol = "https:";
	return secureUrl;
};

const setLegacyNoCacheHeaders = (response: NextResponse) => {
	response.headers.set("Expires", "0");
	response.headers.set("Pragma", "no-cache");
};

// noinspection JSUnusedGlobalSymbols
export const proxy = async (request: NextRequest) => {
	if (shouldRedirectToHttps(request)) {
		return NextResponse.redirect(getSecureUrl(request), 308);
	}
	
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
