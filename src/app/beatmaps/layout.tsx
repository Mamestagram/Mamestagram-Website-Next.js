import type { ReactNode } from "react";
import NameBodyHeader from "@/components/name-body-header";

export default function BeatmapsLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<>
			{children}
			<NameBodyHeader className="beatmaps"/>
		</>
	);
}
