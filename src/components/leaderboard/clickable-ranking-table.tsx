"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

const getRankingRow = (event: MouseEvent<HTMLTableElement>) => {
	if (!(event.target instanceof Element) || event.target.closest("a")) return null;
	return event.target.closest<HTMLTableRowElement>("tr[data-href]");
};

export default function ClickableRankingTable({ children }: Readonly<{ children: ReactNode }>) {
	const router = useRouter();
	const handleClick = (event: MouseEvent<HTMLTableElement>) => {
		if (event.defaultPrevented) return;
		const row = getRankingRow(event);
		const href = row?.dataset.href;
		if (!href) return;
		
		if (event.metaKey || event.ctrlKey || event.shiftKey) {
			window.open(href, "_blank", "noopener,noreferrer");
			return;
		}
		router.push(href);
	};
	const handleAuxClick = (event: MouseEvent<HTMLTableElement>) => {
		if (event.button !== 1) return;
		const href = getRankingRow(event)?.dataset.href;
		if (href) window.open(href, "_blank", "noopener,noreferrer");
	};
	
	return <table onClick={handleClick} onAuxClick={handleAuxClick}>{children}</table>;
}
