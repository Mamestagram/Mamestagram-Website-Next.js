"use client";

import { type MouseEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FontAwesome from "@/components/font-awesome";
import type { Locale } from "@/app/api/documents/route";
import styles from "@s/documents.module.css";

type SectionKey = "introduction" | "rules" | "connect" | "commands" | "dans" | "faq";

const sectionIcons: Record<SectionKey, string> = {
	introduction: "sparkles",
	rules: "shield-check",
	connect: "plug-circle-bolt",
	commands: "terminal",
	dans: "medal",
	faq: "circle-question"
};

const sectionKeys: SectionKey[] = ["introduction", "rules", "connect", "commands", "dans", "faq"];

export default function DocumentsSidebar({ locale, languageLabel, nav }: {
	locale: Locale,
	languageLabel: string,
	nav: Record<SectionKey, string>
}) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [activeSection, setActiveSection] = useState<SectionKey>("introduction");

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
				const documentHeight = document.documentElement.scrollHeight;
				if (window.scrollY + window.innerHeight >= documentHeight - 24) current = sectionKeys.at(-1)!;
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

	const changeLanguage = (language: Locale) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("lang", language);
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

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
			<div className={styles.language_switcher}>
				<span>{languageLabel}</span>
				<div role="group" aria-label="Document language">
					{(["en", "ja"] as Locale[]).map((language) =>
						<button key={language}
						        type="button"
						        data-active={locale === language}
						        aria-pressed={locale === language}
						        onClick={() => changeLanguage(language)}>
							{language.toUpperCase()}
						</button>)}
				</div>
			</div>
			<nav className={styles.document_nav} aria-label="Document sections">
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
