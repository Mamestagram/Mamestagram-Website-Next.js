"use client";

import { useEffect } from "react";

export default function ScrollMotion() {
	useEffect(() => {
		const header = document.querySelector<HTMLElement>("[data-site-header]");
		if (!header) return;
		const updateHeader = () => {
			header.classList.toggle("scrolled", window.scrollY >= header.offsetHeight);
		};

		updateHeader();
		window.addEventListener("scroll", updateHeader, { passive: true });
		return () => window.removeEventListener("scroll", updateHeader);
	}, []);

	return null;
}
