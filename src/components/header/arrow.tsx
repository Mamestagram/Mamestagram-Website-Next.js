"use client";

import { useRef, useState, useEffect } from "react";
import FontAwesome from "@/components/font-awesome";

export default function ArrowChevron() {
	const arrow = useRef<HTMLButtonElement>(null);
	const navigation = useRef<HTMLElement>(null);
	const [arrowDirection, setArrowDirection] = useState<"up" | "down">("down");
	
	const clickBody = (e: PointerEvent) => {
		if (!arrow.current!.contains(e.target as HTMLDivElement))
			setArrowDirection("down");
	}
	
	const clickArrow = () => {
		setArrowDirection((prevState) => prevState === "down" ? "up" : "down");
	}
	
	useEffect(() => {
		const arrowElement = arrow.current!;
		navigation.current = document.querySelector("header .navigation");
		navigation.current!.classList.remove("mobile-show");
		document.addEventListener("click", clickBody);
		return () => {
			document.removeEventListener("click", clickBody);
			arrowElement.classList.remove("up");
		}
	}, []);
	
	useEffect(() => {
		arrow.current!.classList.remove("up", "down");
		arrow.current!.classList.add(arrowDirection);
		if (arrowDirection === "up")
			navigation.current!.classList.add("mobile-show");
		else
			navigation.current!.classList.remove("mobile-show");
		arrow.current!.classList.remove("up", "down");
		arrow.current!.classList.add(arrowDirection);
		
	}, [arrowDirection]);
	
	return (
		<button className="arrow down" type="button" onClick={clickArrow} ref={arrow}>
			<FontAwesome prefix="fas" name="chevron-down"/>
		</button>
	);
}