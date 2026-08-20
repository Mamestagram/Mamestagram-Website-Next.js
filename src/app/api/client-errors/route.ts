import { NextResponse, type NextRequest } from "next/server";
import { isSameOriginMutation } from "@/lib/api-request";
import { writeError } from "@/lib/log";

const MAX_BODY_BYTES = 20_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_REQUESTS = 20;

type ClientErrorPayload = {
	name: string,
	message: string,
	stack?: string,
	source?: string,
	pathname: string
};

type RateLimitEntry = {
	count: number,
	resetAt: number
};

const globalRateLimits = globalThis as typeof globalThis & {
	mamestagramClientErrorRateLimits?: Map<string, RateLimitEntry>
};
const rateLimits = globalRateLimits.mamestagramClientErrorRateLimits ?? new Map<string, RateLimitEntry>();
globalRateLimits.mamestagramClientErrorRateLimits = rateLimits;

const getIpAddress = (request: NextRequest) =>
	request.headers.get("cf-connecting-ip")
	?? request.headers.get("x-real-ip")
	?? request.headers.get("x-forwarded-for")?.split(",").at(0)?.trim()
	?? "Unknown IP address";

const isRateLimited = (ipAddress: string) => {
	const now = Date.now();
	if (rateLimits.size > 5_000) {
		for (const [key, entry] of rateLimits) {
			if (entry.resetAt <= now) rateLimits.delete(key);
		}
	}
	const current = rateLimits.get(ipAddress);
	if (!current || current.resetAt <= now) {
		rateLimits.set(ipAddress, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
		return false;
	}
	current.count += 1;
	return current.count > RATE_LIMIT_REQUESTS;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

const isOptionalString = (value: unknown) => value === undefined || typeof value === "string";

const isClientErrorPayload = (value: unknown): value is ClientErrorPayload => {
	if (!isRecord(value)) return false;
	return typeof value.name === "string" && value.name.length <= 120
		&& typeof value.message === "string" && value.message.length > 0 && value.message.length <= 8_000
		&& isOptionalString(value.stack) && (typeof value.stack !== "string" || value.stack.length <= 8_000)
		&& isOptionalString(value.source) && (typeof value.source !== "string" || value.source.length <= 1_000)
		&& typeof value.pathname === "string" && value.pathname.length <= 2_000;
};

const readBody = async (request: NextRequest) => {
	const reader = request.body?.getReader();
	if (!reader) return null;
	const chunks: Uint8Array[] = [];
	let byteLength = 0;
	while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		byteLength += value.byteLength;
		if (byteLength > MAX_BODY_BYTES) {
			await reader.cancel();
			return null;
		}
		chunks.push(value);
	}
	const body = new Uint8Array(byteLength);
	let offset = 0;
	for (const chunk of chunks) {
		body.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return new TextDecoder().decode(body);
};

export const POST = async (request: NextRequest) => {
	if (!request.headers.get("origin") || !isSameOriginMutation(request))
		return NextResponse.json({ message: "This request was blocked." }, { status: 403 });

	const ipAddress = getIpAddress(request);
	if (isRateLimited(ipAddress))
		return NextResponse.json({ message: "Too many error reports." }, { status: 429 });

	const body = await readBody(request);
	if (!body)
		return NextResponse.json({ message: "The error report is invalid." }, { status: 413 });

	let payload: unknown;
	try {
		payload = JSON.parse(body);
	}
	catch {
		return NextResponse.json({ message: "The error report is invalid." }, { status: 400 });
	}
	if (!isClientErrorPayload(payload))
		return NextResponse.json({ message: "The error report is invalid." }, { status: 400 });

	const error = new Error(payload.message);
	error.name = payload.name || "ClientError";
	if (payload.stack) error.stack = payload.stack;
	await writeError(error, {
		source: "client",
		method: request.method,
		pathname: payload.pathname,
		routePath: payload.source,
		routeType: "browser",
		ipAddress
	});
	return new NextResponse(null, { status: 204 });
};
