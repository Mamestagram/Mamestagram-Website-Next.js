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
	}, [])
	
	useEffect(() => {
		console.log(scrollPos);
		if (scrollPos >= (header.current?.offsetHeight as number))
			header.current?.classList.add("scrolled");
		else
			header.current?.removeAttribute("class");
	}, [scrollPos]);
	return null;
}