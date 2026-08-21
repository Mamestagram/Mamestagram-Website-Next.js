import type { ReactNode } from "react";
import NameBodyHeader from "@/components/name-body-header";

export default function LeaderboardLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<>
			{children}
			<NameBodyHeader className="profile"/>
		</>
	);
}
