import { InvalidCustomAchievementsError } from "@/database/custom-achievements";
import { parseCustomAchievementIds } from "@/lib/custom-achievements";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { saveProfileUi } from "@/database/profile-ui";
import { isSameOriginMutation } from "@/lib/api-request";
import { writeError } from "@/lib/log";
import type { MutationResponse } from "@/lib/mutation-response";
import { isDefaultProfileUi, parseProfileUiContents } from "@/lib/profile-ui";
import { hasSupporterAccess } from "@/lib/priv";
import { getCurrentUser } from "@/lib/session";

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

export const PUT = async (
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
	if (!hasSupporterAccess(currentUser.priv))
		return NextResponse.json(
			{ success: false, message: "Available to Supporters and Nominator or higher roles." },
			{ status: 403 },
		);

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{ success: false, message: "The profile UI request is invalid." },
			{ status: 400 },
		);
	}
	const contents = isRecord(body) ? parseProfileUiContents(body.contents) : null;
	if (!contents)
		return NextResponse.json(
			{ success: false, message: "The profile UI layout is invalid." },
			{ status: 400 },
		);

	const achievementIds = isRecord(body) && body.achievementIds !== undefined ? parseCustomAchievementIds(body.achievementIds) : undefined;
	if (achievementIds === null) return NextResponse.json(
		{ success: false, message: "Select up to 8 different earned achievements." }, { status: 400 },
	);

	try {
		const restoredDefault = isDefaultProfileUi(contents);
		await saveProfileUi(currentUser.id, contents, achievementIds);
		revalidatePath(`/profile/${currentUser.id}`, "layout");
		revalidatePath("/settings");
		return NextResponse.json({
			success: true,
			message: restoredDefault
				? "Profile UI restored to default."
				: "Profile UI updated.",
		});
	} catch (error: unknown) {
		if (error instanceof InvalidCustomAchievementsError) return NextResponse.json(
			{ success: false, message: error.message }, { status: 400 },
		);
		void writeError(error, {
			source: "server",
			method: "PUT",
			pathname: "/api/settings/profile-ui",
			routeType: "profile-ui-settings",
		});
		return NextResponse.json(
			{ success: false, message: "Profile UI could not be updated." },
			{ status: 500 },
		);
	}
};
