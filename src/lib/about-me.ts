export const MAX_ABOUT_ME_LENGTH = 10_000;
export const MAX_ABOUT_ME_BYTES = 60_000;

export const normalizeAboutMe = (value: unknown) => String(value ?? "").replaceAll("\r\n", "\n").trim();

export const getAboutMeValidationMessage = (content: string) => {
	if (content.length > MAX_ABOUT_ME_LENGTH || new TextEncoder().encode(content).byteLength > MAX_ABOUT_ME_BYTES)
		return `About Me must be ${MAX_ABOUT_ME_LENGTH.toLocaleString()} characters or fewer.`;
	return null;
};
