import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { updateSelectedBadge } from "@/database/settings";
import { isSameOriginMutation } from "@/lib/api-request";
import { getCurrentUser } from "@/lib/session";
import { writeError } from "@/lib/log";
import type { MutationResponse } from "@/lib/mutation-response";

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
		return NextResponse.json({ success: false, message: "The badge request is invalid." }, { status: 400 });
	}
	if (typeof body !== "object" || body === null || !("badgeId" in body))
		return NextResponse.json({ success: false, message: "The badge request is invalid." }, { status: 400 });

	const badgeId = Number(body.badgeId);
	if (!Number.isSafeInteger(badgeId) || badgeId < 0)
		return NextResponse.json({ success: false, message: "The badge request is invalid." }, { status: 400 });

	try {
		if (!await updateSelectedBadge(currentUser.id, badgeId))
			return NextResponse.json({ success: false, message: "You do not own this badge." }, { status: 403 });

		revalidatePath("/", "layout");
		revalidatePath(`/profile/${currentUser.id}`);
		return NextResponse.json({ success: true, message: badgeId === 0 ? "Badge hidden." : "Showcase badge updated." });
	}
	catch (error: unknown) {
		void writeError(error);
		return NextResponse.json(
			{ success: false, message: "The showcase badge could not be updated." },
			{ status: 500 }
		);
	}
};
