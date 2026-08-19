"use client";

import { type MouseEvent, type ReactNode, useEffect, useRef, useState } from "react";
import FontAwesome from "@/components/font-awesome";

type SidebarSection = {
	id: string,
	icon: string,
	label: string,
	prefix?: "fad" | "fab"
};

type SidebarMeta = {
	label: string,
	value: string,
	className: string
};

export default function SectionSidebar({
	className,
	navigationClassName,
	navigationLabel,
	sections,
	header,
	meta
}: Readonly<{
	className: string,
	navigationClassName: string,
	navigationLabel: string,
	sections: readonly SidebarSection[],
	header?: ReactNode,
	meta?: SidebarMeta
}>) {
	const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");
	const navigationRef = useRef<HTMLElement>(null);

	useEffect(() => {
		let frame = 0;
		const updateActiveSection = () => {
			window.cancelAnimationFrame(frame);
			frame = window.requestAnimationFrame(() => {
				const activationLine = Math.min(230, window.innerHeight * .3);
				let current = sections[0]?.id ?? "";
				for (const section of sections) {
					const element = document.getElementById(section.id);
					if (element && element.getBoundingClientRect().top <= activationLine) current = section.id;
					else break;
				}
				if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 24)
					current = sections.at(-1)?.id ?? current;
				setActiveSection(current);
			});
		};

		updateActiveSection();
		window.addEventListener("scroll", updateActiveSection, { passive: true });
		window.addEventListener("resize", updateActiveSection);
		return () => {
			window.cancelAnimationFrame(frame);
			window.removeEventListener("scroll", updateActiveSection);
			window.removeEventListener("resize", updateActiveSection);
		};
	}, [sections]);

	useEffect(() => {
		const navigation = navigationRef.current;
		const activeLink = navigation?.querySelector<HTMLAnchorElement>(`a[href="#${activeSection}"]`);
		if (!navigation || !activeLink) return;

		const edgePadding = 8;
		const navigationRect = navigation.getBoundingClientRect();
		const activeLinkRect = activeLink.getBoundingClientRect();
		let nextScrollLeft = navigation.scrollLeft;
		if (activeLinkRect.left < navigationRect.left + edgePadding)
			nextScrollLeft += activeLinkRect.left - navigationRect.left - edgePadding;
		else if (activeLinkRect.right > navigationRect.right - edgePadding)
			nextScrollLeft += activeLinkRect.right - navigationRect.right + edgePadding;

		if (Math.abs(nextScrollLeft - navigation.scrollLeft) < 1) return;
		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		navigation.scrollTo({ left: nextScrollLeft, behavior: reduceMotion ? "auto" : "smooth" });
	}, [activeSection]);

	const scrollToSection = (event: MouseEvent<HTMLAnchorElement>, section: string) => {
		event.preventDefault();
		const target = document.getElementById(section);
		if (!target) return;
		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
		window.history.pushState(null, "", `#${section}`);
	};

	return (
		<aside className={className} data-page-enter="box">
			{header}
			{meta &&
				<div className={meta.className}>
					<span>{meta.label}</span>
					<strong>{meta.value}</strong>
				</div>}
			<nav ref={navigationRef} className={navigationClassName} aria-label={navigationLabel}>
				{sections.map((section, index) =>
					<a key={section.id}
					   href={`#${section.id}`}
					   data-active={activeSection === section.id}
					   aria-current={activeSection === section.id ? "location" : undefined}
					   onClick={(event) => scrollToSection(event, section.id)}>
						<span>{String(index + 1).padStart(2, "0")}</span>
						<FontAwesome prefix={section.prefix ?? "fad"} name={section.icon}/>
						<strong>{section.label}</strong>
					</a>)}
			</nav>
		</aside>
	);
}
