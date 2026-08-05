"use client";

import { useLayoutEffect } from "react";

export default function NameBodyHeader({ className }: Readonly<{ className: string }>) {
	useLayoutEffect(() => {
		switch (className) {
			case "register":
			case "sign-in":
			case "support":
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
		document.body.classList.add(className);
		document.querySelector("header")!.classList.add(className);
		return () => {
			document.documentElement.style.removeProperty("--user-hue");
			document.body.classList.remove(className);
			document.querySelector("header")!.classList.remove(className);
		}
	}, [className]);
	return null;
}
