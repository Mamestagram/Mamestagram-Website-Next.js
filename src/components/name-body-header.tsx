"use client";

import { useLayoutEffect } from "react";

export default function NameBodyHeader({ className }: Readonly<{ className: string }>) {
	useLayoutEffect(() => {
		document.body.classList.add(className);
		document.querySelector("header")!.classList.add(className);
		return () => {
			document.body.classList.add(className);
			document.querySelector("header")!.classList.remove(className);
		}
	}, [className]);
	return null;
}