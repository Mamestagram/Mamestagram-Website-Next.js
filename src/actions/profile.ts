"use server";

import { revalidatePath } from "next/cache";
import {
	removeClanMember,
	updateClanUserpageContent,
	updatePreferredMode,
	updateUserpageContent
} from "@/database/profile";
import { getAboutMeValidationMessage, normalizeAboutMe } from "@/lib/about-me";
import { writeError } from "@/lib/log";
import { getCurrentUser } from "@/lib/session";
import { bbCodeParser } from "@/lib/bb-code/bb-tags";
import { ModeNum, OsuMode } from "@/lib/mode";

export type AboutMeUpdateResult = {
	success: boolean,
	message: string,
	content?: string,
	html?: string
};

export type MainModeUpdateResult = {
	success: boolean,
	message: string
};

export type ClanMemberKickResult = {
	success: boolean,
	message: string
};

const validateAboutMe = (content: string): AboutMeUpdateResult | null => {
	const message = getAboutMeValidationMessage(content);
	return message ? { success: false, message } : null;
};

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

export async function setMainMode(profileId: number, mode: OsuMode, isClan: boolean): Promise<MainModeUpdateResult> {
	const currentUser = await getCurrentUser();
	if (!currentUser.isLoggedIn || !currentUser.id)
		return { success: false, message: "You must be signed in." };
	if (!Number.isSafeInteger(profileId) || profileId < 1 || !Object.values(OsuMode).includes(mode))
		return { success: false, message: "The mode could not be set." };
	
	const modeNum = ModeNum[mode];
	if (typeof modeNum !== "number")
		return { success: false, message: "The mode could not be set." };
	
	try {
		const updated = await updatePreferredMode(profileId, modeNum, isClan, currentUser.id);
		if (!updated)
			return {
				success: false,
				message: isClan ? "Only the clan leader can change this." : "You can only change your own profile."
			};
		revalidatePath(`/profile/${profileId}/${mode}`);
		return { success: true, message: "Main mode updated." };
	} catch (error: unknown) {
		void writeError(error);
		return { success: false, message: "The main mode could not be updated." };
	}
}

export async function kickClanMember(clanId: number, memberId: number, mode: OsuMode): Promise<ClanMemberKickResult> {
	const currentUser = await getCurrentUser();
	if (!currentUser.isLoggedIn || !currentUser.id)
		return { success: false, message: "You must be signed in." };
	if (!Number.isSafeInteger(clanId) || clanId < 1 ||
		!Number.isSafeInteger(memberId) || memberId < 3 ||
		!Object.values(OsuMode).includes(mode))
		return { success: false, message: "This member could not be removed." };
	if (memberId === currentUser.id)
		return { success: false, message: "The clan owner cannot be kicked." };
	
	try {
		const removed = await removeClanMember(clanId, currentUser.id, memberId);
		if (!removed)
			return { success: false, message: "Only the clan owner can kick current members." };
		revalidatePath(`/profile/${clanId}/${mode}`);
		return { success: true, message: "Member kicked." };
	} catch (error: unknown) {
		void writeError(error);
		return { success: false, message: "This member could not be removed." };
	}
}

export async function updateAboutMe(formData: FormData): Promise<AboutMeUpdateResult> {
	const currentUser = await getCurrentUser();
	if (!currentUser.isLoggedIn || !currentUser.id)
		return { success: false, message: "You must be signed in to edit your profile." };
	
	const content = normalizeAboutMe(formData.get("content"));
	const mode = String(formData.get("mode") ?? "");
	const profileId = Number(formData.get("profileId"));
	const profileType = String(formData.get("profileType") ?? "user");
	if (!Object.values(OsuMode).includes(mode as OsuMode))
		return { success: false, message: "The profile mode is invalid." };
	if (!Number.isSafeInteger(profileId) || profileId < 1 || !["user", "clan"].includes(profileType))
		return { success: false, message: "The profile is invalid." };
	const validationError = validateAboutMe(content);
	if (validationError) return validationError;
	
	try {
		if (profileType === "clan") {
			const updated = await updateClanUserpageContent(profileId, currentUser.id, content);
			if (!updated)
				return { success: false, message: "Only the clan leader can edit this clan profile." };
		}
		else {
			if (profileId !== currentUser.id)
				return { success: false, message: "You can only edit your own profile." };
			await updateUserpageContent(currentUser.id, content);
		}
		revalidatePath(`/profile/${profileId}/${mode}`);
		return {
			success: true,
			message: "About Me updated.",
			content,
			html: bbCodeParser.parseToHtml(content)
		};
	} catch (error: unknown) {
		void writeError(error);
		return { success: false, message: "About Me could not be updated. Please try again later." };
	}
}
