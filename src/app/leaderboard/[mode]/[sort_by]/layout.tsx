import type { Metadata } from "next";
import type { ReactNode } from "react";
import { writeLog } from "@/lib/log";
import NameBodyHeader from "@/components/name-body-header";

export const metadata: Metadata = {
	title: "Leaderboard"
};

export default function LeaderboardLayout({ children }: Readonly<{ children: ReactNode }>) {
	const segment = "leaderboard";
	writeLog("GET", `/${segment}`).then();
	
	return (
		<>
			{children}
			<NameBodyHeader className={segment}/>
		</>
	);
}