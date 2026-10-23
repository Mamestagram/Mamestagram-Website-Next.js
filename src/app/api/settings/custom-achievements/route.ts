import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { InvalidCustomAchievementsError, updateCustomAchievements } from "@/database/custom-achievements";
import { isSameOriginMutation } from "@/lib/api-request";
import { parseCustomAchievementIds } from "@/lib/custom-achievements";
import { writeError } from "@/lib/log";
import type { MutationResponse } from "@/lib/mutation-response";
import { getCurrentUser } from "@/lib/session";

export const PATCH = async (request: NextRequest): Promise<NextResponse<MutationResponse>> => {
	if (!isSameOriginMutation(request))
		return NextResponse.json({ success: false, message: "This request was blocked." }, { status: 403 });
	const currentUser = await getCurrentUser();
	if (!currentUser.isLoggedIn || !currentUser.id)
		return NextResponse.json({ success: false, message: "You must be signed in." }, { status: 401 });
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ success: false, message: "The achievement request is invalid." }, { status: 400 });
	}
	const ids = parseCustomAchievementIds(body !== null && typeof body === "object" && "achievementIds" in body ? body.achievementIds : undefined);
	if (ids === null)
		return NextResponse.json({ success: false, message: "Select up to 8 different earned achievements." }, { status: 400 });
	try {
		await updateCustomAchievements(currentUser.id, ids);
		revalidatePath(`/profile/${currentUser.id}`, "layout");
		revalidatePath("/settings");
		return NextResponse.json({ success: true, message: "Displayed medals updated." });
	} catch (error: unknown) {
		if (error instanceof InvalidCustomAchievementsError)
			return NextResponse.json({ success: false, message: error.message }, { status: 400 });
		void writeError(error, { source: "server", method: "PATCH", pathname: "/api/settings/custom-achievements", routeType: "custom-achievements" });
		return NextResponse.json({ success: false, message: "Displayed medals could not be updated." }, { status: 500 });
	}
};
