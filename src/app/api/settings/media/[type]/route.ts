import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getOwnedClanSettings } from "@/database/settings";
import { isSameOriginMutation } from "@/lib/api-request";
import { getCurrentUser } from "@/lib/session";
import {
	isProfileMediaType,
	MAX_PROFILE_MEDIA_BYTES,
	ProfileMediaError,
	removeProfileMedia,
	saveProfileMedia,
	type ProfileMediaScope
} from "@/lib/profile-media";
import { writeError } from "@/lib/log";
import type { MutationResponse } from "@/lib/mutation-response";

type MediaRouteContext = {
	params: Promise<{ type: string }>
};

type MediaRequestContext =
	| { success: false, error: NextResponse<MutationResponse> }
	| {
		success: true,
		profileId: number,
		scope: ProfileMediaScope,
		type: "avatar" | "banner" | "background"
	};

const mediaLabels = {
	avatar: "Avatar",
	banner: "Banner",
	background: "Background"
} as const;

const getRequestContext = async (
	request: NextRequest,
	context: MediaRouteContext
): Promise<MediaRequestContext> => {
	if (!isSameOriginMutation(request))
		return { success: false, error: NextResponse.json<MutationResponse>({ success: false, message: "This request was blocked." }, { status: 403 }) };

	const currentUser = await getCurrentUser();
	if (!currentUser.isLoggedIn || !currentUser.id)
		return { success: false, error: NextResponse.json<MutationResponse>({ success: false, message: "You must be signed in." }, { status: 401 }) };

	const { type } = await context.params;
	if (!isProfileMediaType(type))
		return { success: false, error: NextResponse.json<MutationResponse>({ success: false, message: "The media type is invalid." }, { status: 404 }) };

	const requestedScope = request.nextUrl.searchParams.get("scope");
	if (requestedScope !== null && requestedScope !== "profile" && requestedScope !== "clan")
		return { success: false, error: NextResponse.json<MutationResponse>({ success: false, message: "The media scope is invalid." }, { status: 400 }) };
	const scope: ProfileMediaScope = requestedScope === "clan" ? "clan" : "profile";
	if (scope === "profile") return { success: true, profileId: currentUser.id, scope, type };

	try {
		const clan = await getOwnedClanSettings(currentUser.id);
		if (!clan)
			return { success: false, error: NextResponse.json<MutationResponse>({ success: false, message: "Only the clan owner can update these images." }, { status: 403 }) };
		return { success: true, profileId: clan.id, scope, type };
	}
	catch (error: unknown) {
		void writeError(error);
		return { success: false, error: NextResponse.json<MutationResponse>({ success: false, message: "Clan ownership could not be verified." }, { status: 500 }) };
	}
};

const mediaErrorResponse = (error: unknown) => {
	if (error instanceof ProfileMediaError) {
		if (error.status >= 500) void writeError(error);
		return NextResponse.json<MutationResponse>({ success: false, message: error.message }, { status: error.status });
	}
	void writeError(error);
	return NextResponse.json<MutationResponse>(
		{ success: false, message: "The profile image could not be updated." },
		{ status: 500 }
	);
};

export const POST = async (request: NextRequest, context: MediaRouteContext): Promise<NextResponse<MutationResponse>> => {
	const requestContext = await getRequestContext(request, context);
	if (!requestContext.success) return requestContext.error;
	const contentLength = Number(request.headers.get("content-length"));
	if (Number.isFinite(contentLength) && contentLength > MAX_PROFILE_MEDIA_BYTES + 1024 * 1024)
		return NextResponse.json({ success: false, message: "The image must be 5 MB or smaller." }, { status: 413 });

	try {
		const formData = await request.formData();
		const image = formData.get("image");
		if (!(image instanceof File))
			return NextResponse.json({ success: false, message: "Choose an image to upload." }, { status: 400 });

		await saveProfileMedia(requestContext.type, requestContext.profileId, image, requestContext.scope);
		revalidatePath(`/profile/${requestContext.profileId}`);
		const label = requestContext.scope === "clan"
			? `Clan ${mediaLabels[requestContext.type].toLowerCase()}`
			: mediaLabels[requestContext.type];
		return NextResponse.json({
			success: true,
			message: `${label} updated.`
		});
	}
	catch (error: unknown) {
		return mediaErrorResponse(error);
	}
};

export const DELETE = async (request: NextRequest, context: MediaRouteContext): Promise<NextResponse<MutationResponse>> => {
	const requestContext = await getRequestContext(request, context);
	if (!requestContext.success) return requestContext.error;

	try {
		await removeProfileMedia(requestContext.type, requestContext.profileId, requestContext.scope);
		revalidatePath(`/profile/${requestContext.profileId}`);
		const label = requestContext.scope === "clan"
			? `Clan ${mediaLabels[requestContext.type].toLowerCase()}`
			: mediaLabels[requestContext.type];
		return NextResponse.json({
			success: true,
			message: `${label} reset.`
		});
	}
	catch (error: unknown) {
		return mediaErrorResponse(error);
	}
};
