"use client";

import { useEffect } from "react";

export default function HeaderMotion() {
	useEffect(() => {
		const headerHeight = document.querySelector("header")?.height as number;
		console.log(headerHeight);
		
	}, []);
	return null;
}