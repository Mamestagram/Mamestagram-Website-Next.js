export const appendAvatarQueryMarker = (imageUrl: string) => {
	if (imageUrl.endsWith("?")) return imageUrl;
	return `${imageUrl}${imageUrl.includes("?") ? "&" : ""}?`;
};
