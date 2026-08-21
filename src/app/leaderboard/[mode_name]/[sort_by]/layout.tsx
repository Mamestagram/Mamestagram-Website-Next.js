import type { Metadata } from "next";
import type { ReactNode } from "react";
import NameBodyHeader from "@/components/name-body-header";

export const metadata: Metadata = {
	title: "Leaderboard"
};

export default function LeaderboardLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<>
			{children}
			<NameBodyHeader className="leaderboard"/>
		</>
	);
}
