"use client";

import { type CSSProperties, type MouseEvent, useEffect, useState } from "react";
import FontAwesome from "@/components/font-awesome";

export default function BackToTop({ className, label }: Readonly<{
	className: string,
	label: string
}>) {
	const [visible, setVisible] = useState(false);
	const [footerOverlap, setFooterOverlap] = useState(0);
	
	useEffect(() => {
		let frame = 0;
		const updatePosition = () => {
			window.cancelAnimationFrame(frame);
			frame = window.requestAnimationFrame(() => {
				const footer = document.querySelector("footer");
				const visibleFooterHeight = footer
					? Math.max(0, window.innerHeight - footer.getBoundingClientRect().top)
					: 0;
				const maximumOffset = Math.max(0, window.innerHeight - 74);
				setFooterOverlap(Math.min(visibleFooterHeight, maximumOffset));
				setVisible(window.scrollY > 120);
			});
		};
		
		updatePosition();
		window.addEventListener("scroll", updatePosition, { passive: true });
		window.addEventListener("resize", updatePosition);
		return () => {
			window.cancelAnimationFrame(frame);
			window.removeEventListener("scroll", updatePosition);
			window.removeEventListener("resize", updatePosition);
		};
	}, []);
	
	const scrollToTop = (event: MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
		window.history.pushState(null, "", "#");
	};
	
	return (
		<a className={className}
		   data-floating={visible}
		   href="#"
		   aria-label={label}
		   style={{ "--footer-overlap": `${footerOverlap}px` } as CSSProperties}
		   onClick={scrollToTop}>
			<FontAwesome prefix="fas" name="arrow-up"/>{label}
		</a>
	);
}
