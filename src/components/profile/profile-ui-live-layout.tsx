"use client";

import { useEffect, useState, type ReactNode } from "react";
import CustomAchievementsCard from "@/components/profile/custom-achievements-card";
import ProfileAppearance from "@/components/profile/profile-appearance";
import ProfileUiLayout from "@/components/profile/profile-ui-layout";
import type { ProfileUiItem, ProfileUiContent } from "@/lib/profile-ui";
import {
	getProfileUiPreviewMessage,
	parseProfileUiPreviewDraft,
	PROFILE_UI_PREVIEW_CHANNEL,
	type ProfileUiPreviewDraft,
} from "@/lib/profile-ui-live-preview";

export default function ProfileUiLiveLayout({ items, contents, profileId }: Readonly<{
	items: ProfileUiItem[];
	contents: Record<ProfileUiContent, ReactNode>;
	profileId: number;
}>) {
	const [draft, setDraft] = useState<ProfileUiPreviewDraft | null>(null);
	useEffect(() => {
		if (window.parent === window) return;
		const receiveDraft = (event: MessageEvent<unknown>) => {
			if (event.origin !== window.location.origin || event.source !== window.parent) return;
			const message = getProfileUiPreviewMessage(event.data, profileId);
			if (message?.type !== "apply") return;
			const next = parseProfileUiPreviewDraft(message.draft);
			if (next) setDraft(next);
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key !== "Escape" || event.defaultPrevented) return;
			window.parent.postMessage({ channel: PROFILE_UI_PREVIEW_CHANNEL, type: "close", profileId }, window.location.origin);
		};
		window.addEventListener("message", receiveDraft);
		window.addEventListener("keydown", closeOnEscape);
		window.parent.postMessage({ channel: PROFILE_UI_PREVIEW_CHANNEL, type: "ready", profileId }, window.location.origin);
		return () => {
			window.removeEventListener("message", receiveDraft);
			window.removeEventListener("keydown", closeOnEscape);
		};
	}, [profileId]);

	useEffect(() => {
		if (!draft || window.parent === window) return;
		window.parent.postMessage({ channel: PROFILE_UI_PREVIEW_CHANNEL, type: "applied", profileId }, window.location.origin);
	}, [draft, profileId]);

	return <>
		<span data-profile-ui-live-preview hidden aria-hidden="true"/>
		{draft && <ProfileAppearance theme={draft.theme} hue={draft.hue} color={draft.color}/>}
		<ProfileUiLayout items={draft?.contents ?? items} contents={draft?.customAchievements === undefined ? contents : { ...contents, custom_achievements: <CustomAchievementsCard achievements={draft.customAchievements} canRevealSecretConditions/> }}/>
	</>;
}
