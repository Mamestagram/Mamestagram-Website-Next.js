"use client";

import { type MouseEvent, useEffect, useState } from "react";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/patcher.module.css";

type SectionKey = "overview" | "features" | "download" | "how-to-use" | "faq";

const sectionIcons: Record<SectionKey, string> = {
	overview: "sparkles",
	features: "wand-magic-sparkles",
	download: "download",
	"how-to-use": "list-check",
	faq: "circle-question"
};

const sectionKeys: SectionKey[] = ["overview", "features", "download", "how-to-use", "faq"];

export default function PatcherSidebar({ nav, version }: {
	nav: Record<SectionKey, string>,
	version: string
}) {
	const [activeSection, setActiveSection] = useState<SectionKey>("overview");

	useEffect(() => {
		let frame = 0;
		const updateActiveSection = () => {
			window.cancelAnimationFrame(frame);
			frame = window.requestAnimationFrame(() => {
				const activationLine = Math.min(230, window.innerHeight * .3);
				let current = sectionKeys[0];
				for (const section of sectionKeys) {
					const element = document.getElementById(section);
					if (element && element.getBoundingClientRect().top <= activationLine) current = section;
					else break;
				}
				if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 24)
					current = sectionKeys.at(-1)!;
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
	}, []);

	const scrollToSection = (event: MouseEvent<HTMLAnchorElement>, section: SectionKey) => {
		event.preventDefault();
		const target = document.getElementById(section);
		if (!target) return;
		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
		window.history.pushState(null, "", `#${section}`);
	};

	return (
		<aside className={styles.sidebar}>
			<div className={styles.sidebar_meta}>
				<span>Patcher guide</span>
				<strong>{version}</strong>
			</div>
			<nav className={styles.patcher_nav} aria-label="Patcher sections">
				{sectionKeys.map((section, index) =>
					<a key={section}
					   href={`#${section}`}
					   data-active={activeSection === section}
					   aria-current={activeSection === section ? "location" : undefined}
					   onClick={(event) => scrollToSection(event, section)}>
						<span>{String(index + 1).padStart(2, "0")}</span>
						<FontAwesome prefix="fad" name={sectionIcons[section]}/>
						<strong>{nav[section]}</strong>
					</a>)}
			</nav>
		</aside>
	);
}
