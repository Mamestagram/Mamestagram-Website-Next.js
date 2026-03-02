import type { Metadata } from "next";
// import { usePathname } from "next/navigation";
// import { cookies } from "next/headers";
import Image from "next/image";
import React from "react";
import type { ServerInfo, UserInfo } from "@/components/context";
import { UserProvider } from "@/components/context";
import Header from "@/components/header/header";
import "flag-icons/css/flag-icons.min.css";
import "@s/global/reset.css";
import "@s/global/global.css";
import "@s/global/font.css";
import "@s/global/mode-icon.css";
import "@s/global/flag-icon.css";
import "@s/global/tooltip.css";

export const metadata: Metadata = {
	title: {
		default: "Home | Mamestagram",
		template: "%s | Mamestagram"
	},
	description: "Welcome to Mamestagram! This is an osu! private server operated by Mamesosu Dev Team."
	
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const serverInfo: ServerInfo = {
		baseDomain: process.env.BASE_DOMAIN!,
		segment: /*usePathname().split("/").at(1) || */"home",
	};
	const userInfo: UserInfo = {
		isLoggedIn: false
	};
	const bannerImages = ["home", "leaderboard", "documents"];
	
	return (
		<html lang="ja">
			<body>
				<UserProvider serverInfo={serverInfo} userInfo={userInfo}>
					<Header/>
					{bannerImages.includes(serverInfo.segment) &&
						<div className="banner">
							<Image src={`/images/banner/${serverInfo.segment}.jpg`} fill sizes="100vw" alt="" priority/>
						</div>}
					<main>
						{children}
					</main>
				</UserProvider>
			</body>
		</html>
	);
}
