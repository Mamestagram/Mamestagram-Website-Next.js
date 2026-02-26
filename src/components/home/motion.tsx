"use client";

import { useLayoutEffect } from "react";

export default function HomeMotion() {
	useLayoutEffect(() => {
		document.body.classList.add("home");
		document.querySelector("header")!.classList.add("home");
		return () => {
			document.body.classList.add("home");
			document.querySelector("header")!.classList.remove("home");
		}
	}, []);
	
	return null;
}