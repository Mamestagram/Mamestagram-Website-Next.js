"use client";

import { usePathname } from "next/navigation";

export default function PageTitle() {
	const segment = usePathname().split("/").at(1) || "home",
		pageTitle = `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`;
	return <h1 className="page-title">{pageTitle}</h1>;
}
