"use client";

import { useUserContext } from "@/components/context";

export default function PageTitle() {
	const subDomain = useUserContext().serverInfo.subDomain,
		pageTitle = `${subDomain.charAt(0).toUpperCase()}${subDomain.slice(1)}`;
	return <h1 className="page-title">{pageTitle}</h1>;
}