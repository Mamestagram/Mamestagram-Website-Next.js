import type { Metadata } from "next";
import React from "react";
import type { ServerInfo, UserInfo } from "@/components/context";
import { UserProvider } from "@/components/context";
import BannerImage from "@/components/banner-image";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const serverInfo: ServerInfo = {
		baseDomain: process.env.BASE_DOMAIN!
	};
	const userInfo: UserInfo = {
		isLoggedIn: false
	};
	
	return (
		<html lang="en">
			<body>
				<UserProvider serverInfo={serverInfo} userInfo={userInfo}>
					<Header/>
					<BannerImage/>
					<main>
						{children}
					</main>
					<Footer/>
				</UserProvider>
			</body>
		</html>
	);
}
