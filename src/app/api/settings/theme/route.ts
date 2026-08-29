import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { updateWebAppearance } from "@/database/settings";
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
		!isWebTheme(body.theme) ||
		(body.hue !== null && !isWebHue(body.hue))
	)
		return NextResponse.json(
			{ success: false, message: "The selected appearance is invalid." },
			{ status: 400 },
		);
	
	try {
		const wasUpdated = await updateWebAppearance(
			currentUser.id,
			body.theme,
			body.hue,
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
			{ success: false, message: "Appearance could not be updated." },
			{ status: 500 },
		);
	}
};
