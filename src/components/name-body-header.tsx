"use client";

import { useLayoutEffect } from "react";

export default function NameBodyHeader({ className }: Readonly<{ className: string }>) {
	useLayoutEffect(() => {
		switch (className) {
			case "home":
			case "leaderboard":
			case "profile":
				document.documentElement.style.setProperty("--user-hue", "210");
				break;
		}
		document.body.classList.add(className);
		document.querySelector("header")!.classList.add(className);
		return () => {
			document.body.classList.add(className);
			document.querySelector("header")!.classList.remove(className);
		}
	}, [className]);
	return null;
}