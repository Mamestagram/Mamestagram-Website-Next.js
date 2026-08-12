import LanguageSwitcher from "@/components/language-switcher";
import SectionSidebar from "@/components/section-sidebar";
import type { LazerLocale } from "@/components/lazer-patcher/patcher-content";
import styles from "@s/patcher.module.css";

type SectionKey = "overview" | "platforms" | "download" | "windows" | "macos";

const sectionMeta: ReadonlyArray<{ id: SectionKey, icon: string, prefix?: "fad" | "fab" }> = [
	{ id: "overview", icon: "sparkles" },
	{ id: "platforms", icon: "laptop-mobile" },
	{ id: "download", icon: "download" },
	{ id: "windows", icon: "windows", prefix: "fab" },
	{ id: "macos", icon: "apple", prefix: "fab" }
];

export default function PatcherSidebar({ locale, languageLabel, nav }: Readonly<{
	locale: LazerLocale,
	languageLabel: string,
	nav: Record<SectionKey, string>
}>) {
	const sections = sectionMeta.map(({ id, icon, prefix }) => ({ id, icon, label: nav[id], prefix }));
	return <SectionSidebar className={styles.sidebar}
	                       navigationClassName={styles.patcher_nav}
	                       navigationLabel={locale === "ja" ? "Lazerページのセクション" : "Lazer sections"}
	                       sections={sections}
	                       header={<LanguageSwitcher className={styles.language_switcher}
	                                                   current={locale}
	                                                   label={languageLabel}
	                                                   ariaLabel={locale === "ja" ? "Lazerページの言語" : "Lazer page language"}/>}/>;
}
