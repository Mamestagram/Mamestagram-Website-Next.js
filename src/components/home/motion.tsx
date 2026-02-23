"use client";

import { useLayoutEffect } from "react";

export default function HomeMotion() {
	useLayoutEffect(() => {
		document.querySelector("header")!.classList.add("home");
		return () => {
			document.querySelector("header")!.classList.remove("home");
		}
	}, []);
	
	return null;
}