"use client";

import { useEffect } from "react";

export default function ScrollMotion() {
	useEffect(() => {
		const header = document.querySelector<HTMLElement>("[data-site-header]");
		if (!header) return;
		let animationFrame = 0;
		let headerHeight = header.offsetHeight;
		const updateHeader = () => {
			animationFrame = 0;
			header.classList.toggle("scrolled", window.scrollY >= headerHeight);
		};
		const scheduleUpdate = () => {
			if (animationFrame !== 0) return;
			animationFrame = window.requestAnimationFrame(updateHeader);
		};
		const resizeObserver = new ResizeObserver(() => {
			headerHeight = header.offsetHeight;
			scheduleUpdate();
		});
		
		updateHeader();
		resizeObserver.observe(header);
		window.addEventListener("scroll", scheduleUpdate, { passive: true });
		return () => {
			window.removeEventListener("scroll", scheduleUpdate);
			resizeObserver.disconnect();
			if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
		};
	}, []);
	
	return null;
}
