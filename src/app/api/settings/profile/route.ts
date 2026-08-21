import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { updateProfileSettings } from "@/database/settings";
import { isSameOriginMutation } from "@/lib/api-request";
import { getCurrentUser } from "@/lib/session";
import { writeError } from "@/lib/log";
import type { MutationResponse } from "@/lib/mutation-response";

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

export const PATCH = async (request: NextRequest): Promise<NextResponse<MutationResponse>> => {
	if (!isSameOriginMutation(request))
		return NextResponse.json({ success: false, message: "This request was blocked." }, { status: 403 });

	const currentUser = await getCurrentUser();
	if (!currentUser.isLoggedIn || !currentUser.id)
		return NextResponse.json({ success: false, message: "You must be signed in." }, { status: 401 });

	let body: unknown;
	try {
		body = await request.json();
	}
	catch {
		return NextResponse.json({ success: false, message: "The settings request is invalid." }, { status: 400 });
	}
	if (!isRecord(body) || typeof body.username !== "string" || typeof body.showPastNames !== "boolean" ||
		typeof body.isPrivate !== "boolean")
		return NextResponse.json({ success: false, message: "The settings request is invalid." }, { status: 400 });

	const username = body.username.trim();
	if (username.length < 2 || username.length > 15)
		return NextResponse.json({ success: false, message: "Username must be between 2 and 15 characters." }, { status: 400 });
	if (!/^[\p{L}\p{N}_\[\] -]+$/u.test(username))
		return NextResponse.json({ success: false, message: "Username contains unsupported characters." }, { status: 400 });

	try {
		const result = await updateProfileSettings(currentUser.id, username, body.showPastNames, body.isPrivate);
		if (!result.success) {
			if (result.reason === "conflict")
				return NextResponse.json({ success: false, message: "This username is already in use." }, { status: 409 });
			return NextResponse.json({ success: false, message: "This account could not be found." }, { status: 404 });
		}

		revalidatePath("/", "layout");
		revalidatePath(`/profile/${currentUser.id}`, "layout");
		return NextResponse.json({ success: true, message: "Profile settings updated." });
	}
	catch (error: unknown) {
		void writeError(error);
		return NextResponse.json(
			{ success: false, message: "Profile settings could not be updated." },
			{ status: 500 }
		);
	}
};
