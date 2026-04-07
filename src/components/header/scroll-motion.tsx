"use client";

import { useRef, useEffect, useState } from "react";

export default function ScrollMotion() {
	const header = useRef<HTMLElement>(null);
	const [scrollPos, setScrollPos] = useState(0);
	
	const scrollHeader = () => {
		setScrollPos(window.scrollY);
	}
	
	useEffect(() => {
		header.current = document.querySelector("header");
		window.addEventListener("scroll", scrollHeader);
		return () => {
			window.removeEventListener("scroll", scrollHeader);
		}
	}, []);
	
	useEffect(() => {
		if (scrollPos >= header.current!.offsetHeight)
			header.current!.classList.add("scrolled");
		else
			header.current!.classList.remove("scrolled");
	}, [scrollPos]);
	
	return null;
}