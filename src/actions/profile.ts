"use server";

import { revalidatePath } from "next/cache";
import { updateUserpageContent } from "@/database/profile";
import { getCurrentUser } from "@/lib/session";
import { bbCodeParser } from "@/lib/bb-code/bb-tags";
import { OsuMode } from "@/lib/mode";

const MAX_ABOUT_ME_LENGTH = 10_000;
const MAX_ABOUT_ME_BYTES = 60_000;

export type AboutMeUpdateResult = {
	success: boolean,
	message: string,
	content?: string,
	html?: string
};

const normalizeAboutMe = (value: unknown) => String(value ?? "").replaceAll("\r\n", "\n").trim();

const validateAboutMe = (content: string): AboutMeUpdateResult | null => {
	if (content.length > MAX_ABOUT_ME_LENGTH || Buffer.byteLength(content, "utf8") > MAX_ABOUT_ME_BYTES)
		return { success: false, message: `About Me must be ${MAX_ABOUT_ME_LENGTH.toLocaleString()} characters or fewer.` };
	return null;
}

export async function previewAboutMe(value: string): Promise<AboutMeUpdateResult> {
	const currentUser = await getCurrentUser();
	if (!currentUser.isLoggedIn || !currentUser.id)
		return { success: false, message: "You must be signed in to preview your profile." };

	const content = normalizeAboutMe(value);
	const validationError = validateAboutMe(content);
	if (validationError) return validationError;

	return {
		success: true,
		message: "Preview generated.",
		content,
		html: bbCodeParser.parseToHtml(content)
	};
}

export async function updateAboutMe(formData: FormData): Promise<AboutMeUpdateResult> {
	const currentUser = await getCurrentUser();
	if (!currentUser.isLoggedIn || !currentUser.id)
		return { success: false, message: "You must be signed in to edit your profile." };

	const content = normalizeAboutMe(formData.get("content"));
	const mode = String(formData.get("mode") ?? "");
	if (!Object.values(OsuMode).includes(mode as OsuMode))
		return { success: false, message: "The profile mode is invalid." };
	const validationError = validateAboutMe(content);
	if (validationError) return validationError;

	try {
		await updateUserpageContent(currentUser.id, content);
		revalidatePath(`/profile/${currentUser.id}/${mode}`);
		return {
			success: true,
			message: "About Me updated.",
			content,
			html: bbCodeParser.parseToHtml(content)
		};
	}
	catch {
		return { success: false, message: "About Me could not be updated. Please try again later." };
	}
}
