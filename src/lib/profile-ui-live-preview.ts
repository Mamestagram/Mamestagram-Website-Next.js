import { isAccentColor } from "@/lib/accent-color";
import { parseCustomAchievements, type CustomAchievementSelection } from "@/lib/custom-achievements";
import { isDefaultProfileUi, parseProfileUiContents, type ProfileUiItem } from "@/lib/profile-ui";
import { isWebHue, isWebTheme, type WebTheme } from "@/lib/theme";

export const PROFILE_UI_PREVIEW_CHANNEL = "profile-ui-preview";
export type ProfileUiPreviewDraft = {
	contents: ProfileUiItem[];
	customAchievements?: CustomAchievementSelection;
	theme: WebTheme;
	hue: number | null;
	color: string | null;
};

export const parseProfileUiPreviewDraft = (value: unknown): ProfileUiPreviewDraft | null => {
	if (value === null || typeof value !== "object") return null;
	const raw = value as Record<string, unknown>;
	const contents = parseProfileUiContents(raw.contents);
	if (!contents || !isWebTheme(raw.theme) || (raw.hue !== null && !isWebHue(raw.hue))) return null;
	if (raw.color !== undefined && raw.color !== null && !isAccentColor(raw.color)) return null;
	const customAchievements = raw.customAchievements === undefined ? undefined : parseCustomAchievements(raw.customAchievements);
	if (customAchievements === null) return null;
	const customized = !isDefaultProfileUi(contents);
	return {
		contents: contents.map((content) => ({ ...content, customized })),
		...(customAchievements === undefined ? {} : { customAchievements }),
		theme: raw.theme,
		hue: raw.hue,
		color: typeof raw.color === "string" ? raw.color.toLowerCase() : null,
	};
};

export const getProfileUiPreviewMessage = (value: unknown, profileId: number) => {
	if (value === null || typeof value !== "object") return null;
	const message = value as Record<string, unknown>;
	if (message.channel !== PROFILE_UI_PREVIEW_CHANNEL || message.profileId !== profileId) return null;
	return message;
};
