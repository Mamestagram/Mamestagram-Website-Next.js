import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { updateClanSettings } from "@/database/settings";
import { isSameOriginMutation } from "@/lib/api-request";
import { writeError } from "@/lib/log";
import type { MutationResponse } from "@/lib/mutation-response";
import { getCurrentUser } from "@/lib/session";

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
		return NextResponse.json({ success: false, message: "The clan settings request is invalid." }, { status: 400 });
	}
	if (!isRecord(body) || typeof body.tag !== "string" || typeof body.showPastTags !== "boolean")
		return NextResponse.json({ success: false, message: "The clan settings request is invalid." }, { status: 400 });

	const tag = body.tag.trim();
	const tagLength = Array.from(tag).length;
	if (tagLength < 1 || tagLength > 6)
		return NextResponse.json({ success: false, message: "Clan tag must be between 1 and 6 characters." }, { status: 400 });
	if (/\s/u.test(tag) || /[\p{Cc}\p{Cf}]/u.test(tag))
		return NextResponse.json({ success: false, message: "Clan tag cannot contain spaces or control characters." }, { status: 400 });

	try {
		const result = await updateClanSettings(currentUser.id, tag, body.showPastTags);
		if (!result.success) {
			if (result.reason === "conflict")
				return NextResponse.json({ success: false, message: "This clan tag is already in use." }, { status: 409 });
			return NextResponse.json({ success: false, message: "Only the clan owner can update these settings." }, { status: 403 });
		}

		revalidatePath("/settings");
		revalidatePath(`/profile/${result.clanId}`, "layout");
		return NextResponse.json({ success: true, message: "Clan settings updated." });
	}
	catch (error: unknown) {
		void writeError(error);
		return NextResponse.json(
			{ success: false, message: "Clan settings could not be updated." },
			{ status: 500 }
		);
	}
};
