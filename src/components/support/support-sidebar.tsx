"use client";

import { type MouseEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FontAwesome from "@/components/font-awesome";
import type { SupportLocale } from "@/components/support/support-content";
import styles from "@s/support.module.css";

type SectionKey = "introduction" | "features" | "subscription";

const sectionKeys: SectionKey[] = ["introduction", "features", "subscription"];
const sectionIcons: Record<SectionKey, string> = {
	introduction: "heart-circle-check",
	features: "sparkles",
	subscription: "badge-check"
};

export default function SupportSidebar({ locale, languageLabel, nav }: {
	locale: SupportLocale,
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

	const changeLanguage = (language: SupportLocale) => {
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
				<div role="group" aria-label="Support page language">
					{(["en", "ja"] as SupportLocale[]).map((language) =>
						<button key={language}
						        type="button"
						        data-active={locale === language}
						        aria-pressed={locale === language}
						        onClick={() => changeLanguage(language)}>
							{language.toUpperCase()}
						</button>)}
				</div>
			</div>
			<nav className={styles.support_nav} aria-label="Support sections">
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
