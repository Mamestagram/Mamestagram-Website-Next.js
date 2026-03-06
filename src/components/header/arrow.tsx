"use client";

import { useRef, useState, useLayoutEffect, useEffect } from "react";
import FontAwesome from "@/components/font-awesome";

export default function ArrowChevron() {
	const arrow = useRef<HTMLDivElement>(null);
	const [arrowDirection, setArrowDirection] = useState<"up" | "down">("down");
	
	const clickArrow = () => {
		setArrowDirection((prevState) => prevState === "down" ? "up" : "down");
	}
	
	useLayoutEffect(() => {
		const arrowElement = arrow.current!;
		arrowElement.classList.add("down");
		arrowElement.addEventListener("click", clickArrow);
		return () => {
			arrowElement.classList.remove("up", "down");
			arrowElement.removeEventListener("click", clickArrow);
		}
	}, []);
	
	return (
		<div className="arrow" ref={arrow}>
			<FontAwesome prefix="fas" name="chevron-down"/>
		</div>
	);
}