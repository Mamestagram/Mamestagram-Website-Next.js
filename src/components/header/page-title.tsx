"use client";

import { useUserContext } from "@/components/context";

export default function PageTitle() {
	const segment = useUserContext().serverInfo.segment,
		pageTitle = `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`;
	return <h1 className="page-title">{pageTitle}</h1>;
}