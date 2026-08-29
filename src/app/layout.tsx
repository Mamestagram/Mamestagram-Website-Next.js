import type { Metadata, Viewport } from "next";
import {
	Fragment_Mono,
	JetBrains_Mono,
	M_PLUS_1_Code,
	Space_Mono,
} from "next/font/google";
import type { CSSProperties, ReactNode } from "react";
import type { ServerInfo, UserInfo } from "@/components/context/user-provider";
import { UserProvider } from "@/components/context/user-provider";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import RenderingPerformanceMode from "@/components/rendering-performance-mode";
import { getUserWebHue, getUserWebTheme } from "@/database/settings";
import { getLoadingScreenEmbedUrl } from "@/lib/loading-screen";
import { resolveProfileAvatarUrl } from "@/lib/profile-banner";
import { getProfileCosmetics } from "@/lib/profile-cosmetics";
import { getCurrentUser } from "@/lib/session";
import { DEFAULT_WEB_THEME, getWebThemeName } from "@/lib/theme";
import "flag-icons/css/flag-icons.min.css";
import "@s/global/reset.css";
import "@s/global/global.css";
import "@s/global/fonts.css";
import "@s/global/mode-icon.css";
import "@s/global/flag-icon.css";
import "@s/global/tooltip.css";
import "@s/global/performance.css";
import "@s/global/theme.css";

const fragmentMono = Fragment_Mono({
	display: "swap",
	subsets: ["latin"],
	variable: "--font-fragment-mono",
	weight: "400",
});
const jetBrainsMono = JetBrains_Mono({
	display: "swap",
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
});
const mPlusOneCode = M_PLUS_1_Code({
	display: "swap",
	subsets: ["latin"],
	variable: "--font-m-plus-1-code",
});
const spaceMono = Space_Mono({
	display: "swap",
	style: ["normal", "italic"],
	subsets: ["latin"],
	variable: "--font-space-mono",
	weight: ["400", "700"],
});
const fontVariables = [
	fragmentMono.variable,
	jetBrainsMono.variable,
	mPlusOneCode.variable,
	spaceMono.variable,
].join(" ");

type UserHueStyle = CSSProperties & {
	"--user-hue": number;
};

export const metadata: Metadata = {
	title: {
		default: "Home | Mamestagram",
		template: "%s | Mamestagram",
	},
	description:
		"Welcome to Mamestagram! This is an osu! private server operated by Mamesosu Dev Team.",
	icons: {
		icon: "/favicon.ico",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
	themeColor: "hsl(228, 29.412%, 3.333%)",
};

export default async function RootLayout({
	children,
}: Readonly<{ children: ReactNode }>) {
	const serverInfo: ServerInfo = {
		baseDomain: process.env.BASE_DOMAIN!,
	};
	const userInfo: UserInfo = await getCurrentUser();
	const [
		userAvatarUrl,
		userCosmetics,
		loadingScreenEmbedUrl,
		webTheme,
		webHue,
	] = await Promise.all([
		userInfo.id
			? resolveProfileAvatarUrl(userInfo.id, false, serverInfo.baseDomain)
			: Promise.resolve(null),
		userInfo.id ? getProfileCosmetics(userInfo.id) : Promise.resolve(null),
		userInfo.id ? getLoadingScreenEmbedUrl(userInfo.id) : Promise.resolve(null),
		userInfo.id
			? getUserWebTheme(userInfo.id)
			: Promise.resolve(DEFAULT_WEB_THEME),
		userInfo.id ? getUserWebHue(userInfo.id) : Promise.resolve(null),
	]);
	const userHueStyle: UserHueStyle | undefined =
		webHue === null ? undefined : { "--user-hue": webHue };
	
	return (
		<html
			className={fontVariables}
			lang="en"
			data-theme={getWebThemeName(webTheme)}
			data-user-hue={webHue ?? undefined}
			style={userHueStyle}
		>
			<body>
				<RenderingPerformanceMode/>
				<UserProvider
					serverInfo={serverInfo}
					userInfo={userInfo}
					userAvatarUrl={userAvatarUrl}
					userCosmetics={userCosmetics}
					loadingScreenEmbedUrl={loadingScreenEmbedUrl}
				>
					<Header/>
					<main>{children}</main>
					<Footer/>
				</UserProvider>
			</body>
		</html>
	);
}
