import type { Locale } from "@/app/api/documents/route";
import LanguageSwitcher from "@/components/language-switcher";
import SectionSidebar from "@/components/section-sidebar";
import styles from "@s/documents.module.css";

type SectionKey = "introduction" | "rules" | "connect" | "commands" | "bbcode" | "dans" | "faq";

const sectionMeta: ReadonlyArray<{ id: SectionKey, icon: string }> = [
	{ id: "introduction", icon: "sparkles" },
	{ id: "rules", icon: "shield-check" },
	{ id: "connect", icon: "plug-circle-bolt" },
	{ id: "commands", icon: "terminal" },
	{ id: "bbcode", icon: "brackets-square" },
	{ id: "dans", icon: "medal" },
	{ id: "faq", icon: "circle-question" }
];

export default function DocumentsSidebar({ locale, languageLabel, nav }: Readonly<{
	locale: Locale,
	languageLabel: string,
	nav: Record<SectionKey, string>
}>) {
	const sections = sectionMeta.map(({ id, icon }) => ({ id, icon, label: nav[id] }));
	return <SectionSidebar className={styles.sidebar}
	                       navigationClassName={styles.document_nav}
	                       navigationLabel="Document sections"
	                       sections={sections}
	                       header={<LanguageSwitcher className={styles.language_switcher}
	                                                 current={locale}
	                                                 label={languageLabel}
	                                                 ariaLabel="Document language"/>}/>;
}
