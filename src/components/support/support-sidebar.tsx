import LanguageSwitcher from "@/components/language-switcher";
import SectionSidebar from "@/components/section-sidebar";
import type { SupportLocale } from "@/components/support/support-content";
import styles from "@s/support.module.css";

type SectionKey = "introduction" | "features" | "subscription";

const sectionMeta: ReadonlyArray<{ id: SectionKey, icon: string }> = [
	{ id: "introduction", icon: "heart-circle-check" },
	{ id: "features", icon: "sparkles" },
	{ id: "subscription", icon: "badge-check" }
];

export default function SupportSidebar({ locale, languageLabel, nav }: Readonly<{
	locale: SupportLocale,
	languageLabel: string,
	nav: Record<SectionKey, string>
}>) {
	const sections = sectionMeta.map(({ id, icon }) => ({ id, icon, label: nav[id] }));
	return <SectionSidebar className={styles.sidebar}
	                       navigationClassName={styles.support_nav}
	                       navigationLabel="Support sections"
	                       sections={sections}
	                       header={<LanguageSwitcher className={styles.language_switcher}
	                                                 current={locale}
	                                                 label={languageLabel}
	                                                 ariaLabel="Support page language"/>}/>;
}
