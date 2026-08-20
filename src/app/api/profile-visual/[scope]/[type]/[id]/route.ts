import { NextResponse } from "next/server";
import { writeError } from "@/lib/log";

type ProfileVisualRouteContext = {
	params: Promise<{
		id: string,
		scope: string,
		type: string
	}>
};

const getUpstreamUrl = (
	id: number,
	scope: string,
	type: string,
	baseDomain: string
) => {
	const isClan = scope === "clan";
	const subdomain = type === "cover"
		? isClan ? "clan-banner" : "banner"
		: isClan ? "clan-bg" : "bg";
	return `https://${subdomain}.${baseDomain}/${id}`;
};

export const GET = async (
	_request: Request,
	context: ProfileVisualRouteContext
) => {
	const { id: idParam, scope, type } = await context.params;
	const id = Number(idParam);
	if (!Number.isSafeInteger(id) || id <= 0 ||
		(scope !== "profile" && scope !== "clan") ||
		(type !== "cover" && type !== "background"))
		return new NextResponse(null, { status: 404 });

	const baseDomain = process.env.BASE_DOMAIN;
	if (!baseDomain) return new NextResponse(null, { status: 503 });

	try {
		const response = await fetch(getUpstreamUrl(id, scope, type, baseDomain), {
			cache: "no-store",
			signal: AbortSignal.timeout(5000)
		});
		const contentType = response.headers.get("content-type");
		if (!response.ok || contentType?.startsWith("image/") !== true)
			return new NextResponse(null, { status: 404 });

		const headers = new Headers({
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": contentType
		});
		for (const name of ["content-length", "etag", "last-modified"] as const) {
			const value = response.headers.get(name);
			if (value) headers.set(name, value);
		}
		return new NextResponse(response.body, { headers });
	}
	catch (error: unknown) {
		void writeError(error);
		return new NextResponse(null, { status: 502 });
	}
};
