"use client";

import { useLayoutEffect } from "react";

export default function NameBodyHeader({
	className,
}: Readonly<{ className: string }>) {
	useLayoutEffect(() => {
		const header = document.querySelector("[data-site-header]");
		const hasCustomHue = document.documentElement.dataset.userHue !== undefined;
		const hasProfileAppearance =
			className === "profile" &&
			document.querySelector("[data-profile-appearance]") !== null;
		
		if (!hasCustomHue && !hasProfileAppearance) {
			switch (className) {
				case "register":
				case "sign-in":
				case "support":
				case "settings":
					document.documentElement.style.setProperty("--user-hue", "18");
					break;
				case "home":
				case "leaderboard":
				case "profile":
					document.documentElement.style.setProperty("--user-hue", "210");
					break;
				case "beatmaps":
					document.documentElement.style.setProperty("--user-hue", "200");
					break;
				case "documents":
				case "patcher":
					document.documentElement.style.setProperty("--user-hue", "43");
					break;
			}
		}
		document.body.classList.add(className);
		header?.classList.add(className);
		return () => {
			if (
				!hasProfileAppearance &&
				!hasCustomHue &&
				document.documentElement.dataset.userHue === undefined
			)
				document.documentElement.style.removeProperty("--user-hue");
			document.body.classList.remove(className);
			header?.classList.remove(className);
		};
	}, [className]);
	return null;
}
