import type { Metadata } from "next";
import { cookies } from "next/headers";
import Head from "next/head";
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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const cookieStore = await cookies();
	const serverInfo: ServerInfo = {
		baseDomain: process.env.BASE_DOMAIN!,
		subDomain: cookieStore.get("sub-domain")!.value
	};
	const userInfo: UserInfo = {
		isLoggedIn: false
	};
	
	return (
		<html lang="ja">
			<Head>
				<meta charSet="utf-8"/>
				<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
				<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
			</Head>
			<body>
				<UserProvider serverInfo={serverInfo} userInfo={userInfo}>
					<Header/>
					<div className="banner">
						<Image src={`/images/banner/${serverInfo.subDomain}.jpg`} fill sizes="100vw" alt="" priority/>
					</div>
					<main>
						{children}
					</main>
				</UserProvider>
			</body>
		</html>
	);
}
