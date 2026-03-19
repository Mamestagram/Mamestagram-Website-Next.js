"use client";

import { useRef, useEffect } from "react";

export default function ScrollMotion() {
	const header = useRef<HTMLElement>(null);
	
	const scrollHeader = () => {
		if (window.scrollY >= header.current!.offsetHeight)
			header.current!.classList.add("scrolled");
		else
			header.current!.classList.remove("scrolled");
	}
	
	useEffect(() => {
		header.current = document.querySelector("header");
		window.addEventListener("scroll", scrollHeader);
		return () => {
			window.removeEventListener("scroll", scrollHeader);
		}
	}, []);
	
	return null;
}