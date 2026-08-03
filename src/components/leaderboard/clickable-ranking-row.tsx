"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

export default function ClickableRankingRow({ className, href, children }: Readonly<{
	className: string,
	href: string,
	children: ReactNode
}>) {
	const router = useRouter();
	const isChildLink = (event: MouseEvent<HTMLTableRowElement>) =>
		(event.target as HTMLElement).closest("a") !== null;
	const handleClick = (event: MouseEvent<HTMLTableRowElement>) => {
		if (event.defaultPrevented || isChildLink(event)) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey) {
			window.open(href, "_blank", "noopener,noreferrer");
			return;
		}
		router.push(href);
	};
	const handleAuxClick = (event: MouseEvent<HTMLTableRowElement>) => {
		if (event.button === 1 && !isChildLink(event)) {
			window.open(href, "_blank", "noopener,noreferrer");
		}
	};

	return (
		<tr className={className} onClick={handleClick} onAuxClick={handleAuxClick}>
			{children}
		</tr>
	);
}
