import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { updateClanPrivacy, updateProfilePrivacy } from "@/database/settings";
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
		return NextResponse.json({ success: false, message: "The privacy request is invalid." }, { status: 400 });
	}
	if (!isRecord(body) || typeof body.isPrivate !== "boolean")
		return NextResponse.json({ success: false, message: "The privacy request is invalid." }, { status: 400 });

	const isClan = request.nextUrl.searchParams.get("scope") === "clan";
	try {
		if (isClan) {
			const clanId = await updateClanPrivacy(currentUser.id, body.isPrivate);
			if (clanId === null)
				return NextResponse.json(
					{ success: false, message: "Only the clan owner can update clan privacy." },
					{ status: 403 }
				);
			revalidatePath(`/profile/${clanId}`, "layout");
		}
		else {
			const wasUpdated = await updateProfilePrivacy(currentUser.id, body.isPrivate);
			if (!wasUpdated)
				return NextResponse.json(
					{ success: false, message: "This account could not be found." },
					{ status: 404 }
				);
			revalidatePath(`/profile/${currentUser.id}`, "layout");
		}

		revalidatePath("/settings");
		return NextResponse.json({
			success: true,
			message: `${isClan ? "Clan" : "Profile"} privacy updated.`
		});
	}
	catch (error: unknown) {
		void writeError(error, {
			source: "server",
			method: "PATCH",
			pathname: "/api/settings/privacy",
			routeType: isClan ? "clan-privacy" : "profile-privacy"
		});
		return NextResponse.json(
			{ success: false, message: `${isClan ? "Clan" : "Profile"} privacy could not be updated.` },
			{ status: 500 }
		);
	}
};
