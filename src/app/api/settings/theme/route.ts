import { getAccentHue, isAccentColor } from "@/lib/accent-color";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { AppearanceSchemaError, updateWebAppearance } from "@/database/settings";
import { isSameOriginMutation } from "@/lib/api-request";
import { writeError } from "@/lib/log";
import type { MutationResponse } from "@/lib/mutation-response";
import { getCurrentUser } from "@/lib/session";
import { isWebHue, isWebTheme } from "@/lib/theme";

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

export const PATCH = async (
	request: NextRequest,
): Promise<NextResponse<MutationResponse>> => {
	if (!isSameOriginMutation(request))
		return NextResponse.json(
			{ success: false, message: "This request was blocked." },
			{ status: 403 },
		);
	
	const currentUser = await getCurrentUser();
	if (!currentUser.isLoggedIn || !currentUser.id)
		return NextResponse.json(
			{ success: false, message: "You must be signed in." },
			{ status: 401 },
		);
	
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{ success: false, message: "The theme request is invalid." },
			{ status: 400 },
		);
	}
	if (
		!isRecord(body) ||
		typeof body.customAppearance !== "boolean" ||
		!isWebTheme(body.theme) ||
		(body.hue !== null && !isWebHue(body.hue)) ||
		(body.color !== undefined && body.color !== null && !isAccentColor(body.color))
	)
		return NextResponse.json(
			{ success: false, message: "The selected appearance is invalid." },
			{ status: 400 },
		);
	
	const color = typeof body.color === "string" ? body.color.toLowerCase() : body.color;
	const hue = typeof color === "string" ? getAccentHue(color) : body.hue;
	try {
		const wasUpdated = await updateWebAppearance(
			currentUser.id,
			body.theme,
			hue,
			body.customAppearance,
			color,
		);
		if (!wasUpdated)
			return NextResponse.json(
				{ success: false, message: "This account could not be found." },
				{ status: 404 },
			);
		
		revalidatePath("/", "layout");
		revalidatePath(`/profile/${currentUser.id}`, "layout");
		revalidatePath("/settings");
		return NextResponse.json({ success: true, message: "Appearance updated." });
	} catch (error: unknown) {
		void writeError(error, {
			source: "server",
			method: "PATCH",
			pathname: "/api/settings/theme",
			routeType: "theme-settings",
		});
		return NextResponse.json(
			{ success: false, message: error instanceof AppearanceSchemaError ? error.message : "Appearance could not be updated." },
			{ status: error instanceof AppearanceSchemaError ? 503 : 500 },
		);
	}
};
