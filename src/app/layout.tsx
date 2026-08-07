import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { ServerInfo, UserInfo } from "@/components/context/user-provider";
import { UserProvider } from "@/components/context/user-provider";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import { getCurrentUser } from "@/lib/session";
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

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
	const serverInfo: ServerInfo = {
		baseDomain: process.env.BASE_DOMAIN!
	};
	const userInfo: UserInfo = await getCurrentUser();

	return (
		<html lang="en">
			<body>
				<UserProvider serverInfo={serverInfo} userInfo={userInfo}>
					<Header/>
					{/*<BannerImage/>*/}
					<main>
						{children}
					</main>
					<Footer/>
				</UserProvider>
			</body>
		</html>
	);
}
