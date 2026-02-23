"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";

export default function HeaderMotion() {
	const header = useRef<HTMLElement>(null);
	const [scrollPos, setScrollPos] = useState(0);
	
	const scrollHeader = () => {
		setScrollPos(window.scrollY);
	}
	
	useLayoutEffect(() => {
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