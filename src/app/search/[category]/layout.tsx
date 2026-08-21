import type { ReactNode } from "react";
import NameBodyHeader from "@/components/name-body-header";

export default function SearchLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<>
			{children}
			<NameBodyHeader className="search"/>
		</>
	);
}
