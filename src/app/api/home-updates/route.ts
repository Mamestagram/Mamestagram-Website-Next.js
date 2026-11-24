import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { deleteHomeUpdate, getHomeUpdates, HomeUpdatesSchemaError, saveHomeUpdate } from "@/database/home-updates";
import { isSameOriginMutation } from "@/lib/api-request";
import { isHomeUpdateId, parseHomeUpdateInput } from "@/lib/home-updates";
import { writeError } from "@/lib/log";
import { hasDeveloperAccess } from "@/lib/priv";
import { getCurrentUser } from "@/lib/session";

const authorize = async (request: NextRequest): Promise<NextResponse | null> => {
	if (request.method !== "GET" && !isSameOriginMutation(request)) return NextResponse.json({ success: false, message: "This request was blocked." }, { status: 403 });
	const user = await getCurrentUser();
	if (!user.isLoggedIn || !user.id) return NextResponse.json({ success: false, message: "You must be signed in." }, { status: 401 });
	if (!hasDeveloperAccess(user.priv)) return NextResponse.json({ success: false, message: "Only Developers can manage updates." }, { status: 403 });
	return null;
};

const requestFailure = (error: unknown) => {
	if (!(error instanceof HomeUpdatesSchemaError)) void writeError(error, { source: "server", pathname: "/api/home-updates", routeType: "home-updates" });
	return NextResponse.json({ success: false, message: error instanceof HomeUpdatesSchemaError ? error.message : "Updates are temporarily unavailable. Please try again." }, { status: error instanceof HomeUpdatesSchemaError ? 503 : 500 });
};

export const GET = async (request: NextRequest) => {
	try {
		const denied = await authorize(request);
		if (denied) return denied;
		const beforeId = Number(request.nextUrl.searchParams.get("before"));
		if (!isHomeUpdateId(beforeId)) return NextResponse.json({ success: false, message: "The page cursor is invalid." }, { status: 400 });
		return NextResponse.json({ success: true, ...await getHomeUpdates(beforeId) }, { headers: { "Cache-Control": "no-store" } });
	} catch (error: unknown) {
		return requestFailure(error);
	}
};

const mutate = async (request: NextRequest) => {
	try {
		const denied = await authorize(request);
		if (denied) return denied;
		let body: unknown;
		try { body = await request.json(); } catch {
			return NextResponse.json({ success: false, message: "The update request is invalid." }, { status: 400 });
		}
		const id = typeof body === "object" && body !== null && "id" in body ? body.id : null;
		if (request.method !== "POST" && !isHomeUpdateId(id)) return NextResponse.json({ success: false, message: "The update ID is invalid." }, { status: 400 });
		const input = request.method === "DELETE" ? null : parseHomeUpdateInput(body);
		if (request.method !== "DELETE" && !input) return NextResponse.json({ success: false, message: "Choose Update or Fix, enter a version of 1–16 characters and a title of 1–64 characters, and check the contents length." }, { status: 400 });
		if (request.method === "DELETE") {
			if (!isHomeUpdateId(id) || !await deleteHomeUpdate(id)) return NextResponse.json({ success: false, message: "This update no longer exists." }, { status: 404 });
		} else if (input) {
			const item = await saveHomeUpdate(isHomeUpdateId(id) && request.method !== "POST" ? id : null, input);
			if (!item) return NextResponse.json({ success: false, message: "This update no longer exists." }, { status: 404 });
		}
		revalidatePath("/home");
		revalidatePath("/");
		revalidatePath("/news");
		revalidatePath("/news/[id]", "page");
		return NextResponse.json({ success: true, message: request.method === "DELETE" ? "Update deleted." : "Update saved." });
	} catch (error: unknown) {
		return requestFailure(error);
	}
};

export const POST = mutate;
export const PATCH = mutate;
export const DELETE = mutate;
