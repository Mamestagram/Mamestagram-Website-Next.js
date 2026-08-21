"use client";

import { useRef, useState, useEffect } from "react";
import FontAwesome from "@/components/font-awesome";

export default function ArrowChevron() {
	const arrow = useRef<HTMLButtonElement>(null);
	const navigation = useRef<HTMLElement>(null);
	const [arrowDirection, setArrowDirection] = useState<"up" | "down">("down");

	const clickBody = (e: PointerEvent) => {
		if (!(e.target instanceof Node) || arrow.current?.contains(e.target)) return;

		const accountMenuTrigger = navigation.current?.querySelector<HTMLButtonElement>("li.avatar > button");
		if (accountMenuTrigger?.contains(e.target)) return;

		setArrowDirection("down");
	}

	const clickArrow = () => {
		setArrowDirection((prevState) => prevState === "down" ? "up" : "down");
	}

	useEffect(() => {
		const arrowElement = arrow.current;
		const navigationElement = document.querySelector<HTMLElement>("[data-site-header] .navigation");
		if (!arrowElement || !navigationElement) return;
		navigation.current = navigationElement;
		navigationElement.classList.remove("mobile-show");
		document.addEventListener("click", clickBody);
		return () => {
			document.removeEventListener("click", clickBody);
			arrowElement.classList.remove("up");
			navigationElement.parentElement?.removeAttribute("data-navigation-open");
		}
	}, []);

	useEffect(() => {
		const arrowElement = arrow.current;
		const navigationElement = navigation.current;
		if (!arrowElement || !navigationElement) return;
		arrowElement.classList.remove("up", "down");
		arrowElement.classList.add(arrowDirection);
		navigationElement.classList.toggle("mobile-show", arrowDirection === "up");
		navigationElement.parentElement?.toggleAttribute("data-navigation-open", arrowDirection === "up");
	}, [arrowDirection]);

	return (
		<button className="arrow down" type="button" onClick={clickArrow} ref={arrow}>
			<FontAwesome prefix="fas" name="chevron-down"/>
		</button>
	);
}
