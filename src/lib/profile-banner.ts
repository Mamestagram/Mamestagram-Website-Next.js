import "server-only";

const MINIMUM_BACKGROUND_BYTES = 512;

type ProfileVisualType = "banner" | "background";

const getProfileVisualUrl = (
	type: ProfileVisualType,
	id: number,
	isClan: boolean,
	baseDomain: string
) => {
	const subdomain = type === "banner"
		? isClan ? "clan-banner" : "banner"
		: isClan ? "clan-bg" : "bg";
	return `https://${subdomain}.${baseDomain}/${id}`;
};

const getProfileVisualProxyUrl = (
	type: ProfileVisualType,
	id: number,
	isClan: boolean,
	version: string
) => {
	const scope = isClan ? "clan" : "profile";
	const visualType = type === "banner" ? "cover" : "background";
	const proxyUrl = new URL(
		`/api/profile-visual/${scope}/${visualType}/${id}`,
		"http://localhost"
	);
	proxyUrl.searchParams.set("v", version);
	return `${proxyUrl.pathname}${proxyUrl.search}`;
};

const getProfileVisualVersion = async (imageUrl: string, minimumBytes: number) => {
	try {
		const response = await fetch(imageUrl, {
			method: "HEAD",
			cache: "no-store",
			signal: AbortSignal.timeout(3000)
		});
		if (!response.ok || response.headers.get("content-type")?.startsWith("image/") !== true)
			return null;

		const contentLength = response.headers.get("content-length");
		if (contentLength !== null) {
			const bytes = Number(contentLength);
			if (Number.isFinite(bytes) && bytes < minimumBytes) return null;
		}

		return response.headers.get("etag") ??
			response.headers.get("last-modified") ??
			contentLength ??
			Date.now().toString();
	}
	catch {
		return null;
	}
};

const resolveProfileVisualUrl = async (
	type: ProfileVisualType,
	id: number,
	isClan: boolean,
	baseDomain: string,
	minimumBytes: number = 0
) => {
	const imageUrl = getProfileVisualUrl(type, id, isClan, baseDomain);
	const version = await getProfileVisualVersion(imageUrl, minimumBytes);
	if (version === null) return null;
	return getProfileVisualProxyUrl(type, id, isClan, version);
};

export const resolveProfileBannerUrl = (id: number, isClan: boolean, baseDomain: string) =>
	resolveProfileVisualUrl("banner", id, isClan, baseDomain);

export const resolveProfileBackgroundUrl = (id: number, isClan: boolean, baseDomain: string) =>
	resolveProfileVisualUrl("background", id, isClan, baseDomain, MINIMUM_BACKGROUND_BYTES);
