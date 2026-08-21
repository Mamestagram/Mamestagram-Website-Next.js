import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { updateClanUserpageContent, updateUserpageContent } from "@/database/profile";
import { getOwnedClanSettings } from "@/database/settings";
import { getAboutMeValidationMessage, normalizeAboutMe } from "@/lib/about-me";
import { isSameOriginMutation } from "@/lib/api-request";
import { bbCodeParser } from "@/lib/bb-code/bb-tags";
import { writeError } from "@/lib/log";
import type { MutationResponse } from "@/lib/mutation-response";
import { getCurrentUser } from "@/lib/session";

type AboutMeResponse = MutationResponse & {
	content?: string,
	html?: string
};

type ContentResult =
	| { success: true, content: string }
	| { success: false, message: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

const readContent = async (request: NextRequest): Promise<ContentResult> => {
	let body: unknown;
	try {
		body = await request.json();
	}
	catch {
		return { success: false, message: "The Me request is invalid." };
	}
	if (!isRecord(body) || typeof body.content !== "string")
		return { success: false, message: "The Me request is invalid." };

	const content = normalizeAboutMe(body.content);
	const validationMessage = getAboutMeValidationMessage(content);
	return validationMessage
		? { success: false, message: validationMessage }
		: { success: true, content };
};

export const POST = async (request: NextRequest): Promise<NextResponse<AboutMeResponse>> => {
	if (!isSameOriginMutation(request))
		return NextResponse.json({ success: false, message: "This request was blocked." }, { status: 403 });

	const currentUser = await getCurrentUser();
	if (!currentUser.isLoggedIn || !currentUser.id)
		return NextResponse.json({ success: false, message: "You must be signed in." }, { status: 401 });

	const result = await readContent(request);
	if (!result.success)
		return NextResponse.json(result, { status: 400 });

	return NextResponse.json({
		success: true,
		message: "Preview generated.",
		content: result.content,
		html: bbCodeParser.parseToHtml(result.content)
	});
};

export const PATCH = async (request: NextRequest): Promise<NextResponse<AboutMeResponse>> => {
	if (!isSameOriginMutation(request))
		return NextResponse.json({ success: false, message: "This request was blocked." }, { status: 403 });

	const currentUser = await getCurrentUser();
	if (!currentUser.isLoggedIn || !currentUser.id)
		return NextResponse.json({ success: false, message: "You must be signed in." }, { status: 401 });

	const scope = request.nextUrl.searchParams.get("scope") ?? "profile";
	if (scope !== "profile" && scope !== "clan")
		return NextResponse.json({ success: false, message: "The settings scope is invalid." }, { status: 400 });

	const result = await readContent(request);
	if (!result.success)
		return NextResponse.json(result, { status: 400 });

	try {
		let profileId = currentUser.id;
		if (scope === "clan") {
			const ownedClan = await getOwnedClanSettings(currentUser.id);
			if (!ownedClan)
				return NextResponse.json({ success: false, message: "Only the clan owner can edit this Me." }, { status: 403 });

			const updated = await updateClanUserpageContent(ownedClan.id, currentUser.id, result.content);
			if (!updated)
				return NextResponse.json({ success: false, message: "Only the clan owner can edit this Me." }, { status: 403 });
			profileId = ownedClan.id;
		}
		else await updateUserpageContent(currentUser.id, result.content);

		revalidatePath("/settings");
		revalidatePath(`/profile/${profileId}`);
		return NextResponse.json({
			success: true,
			message: "Me updated.",
			content: result.content,
			html: bbCodeParser.parseToHtml(result.content)
		});
	}
	catch (error: unknown) {
		void writeError(error);
		return NextResponse.json(
			{ success: false, message: "Me could not be updated." },
			{ status: 500 }
		);
	}
};
