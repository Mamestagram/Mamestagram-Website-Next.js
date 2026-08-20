import type { Instrumentation } from "next";

const readHeader = (headers: NodeJS.Dict<string | string[]>, name: string) => {
	const value = headers[name];
	return Array.isArray(value) ? value.at(0) : value;
};

const getIpAddress = (headers: NodeJS.Dict<string | string[]>) =>
	readHeader(headers, "cf-connecting-ip")
	?? readHeader(headers, "x-real-ip")
	?? readHeader(headers, "x-forwarded-for")?.split(",").at(0)?.trim()
	?? "Unknown IP address";

const stripQuery = (path: string) => path.split("?", 1)[0] ?? path;

const isNextControlFlowError = (error: unknown) => {
	if (typeof error !== "object" || error === null || !("digest" in error)) return false;
	const digest = String(error.digest);
	return digest === "DYNAMIC_SERVER_USAGE"
		|| digest === "NEXT_NOT_FOUND"
		|| digest.startsWith("NEXT_REDIRECT");
};

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
	if (process.env.NEXT_RUNTIME !== "nodejs" || isNextControlFlowError(error)) return;
	const { writeError } = await import("@/lib/log");
	await writeError(error, {
		source: "server",
		method: request.method,
		pathname: stripQuery(request.path),
		routePath: context.routePath,
		routeType: context.routeType,
		ipAddress: getIpAddress(request.headers)
	});
};
