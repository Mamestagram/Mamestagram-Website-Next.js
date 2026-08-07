import SectionSidebar from "@/components/section-sidebar";
import styles from "@s/patcher.module.css";

type SectionKey = "overview" | "features" | "download" | "how-to-use" | "faq";

const sectionMeta: ReadonlyArray<{ id: SectionKey, icon: string }> = [
	{ id: "overview", icon: "sparkles" },
	{ id: "features", icon: "wand-magic-sparkles" },
	{ id: "download", icon: "download" },
	{ id: "how-to-use", icon: "list-check" },
	{ id: "faq", icon: "circle-question" }
];

export default function PatcherSidebar({ nav, version }: Readonly<{
	nav: Record<SectionKey, string>,
	version: string
}>) {
	const sections = sectionMeta.map(({ id, icon }) => ({ id, icon, label: nav[id] }));
	return <SectionSidebar className={styles.sidebar}
	                       navigationClassName={styles.patcher_nav}
	                       navigationLabel="Patcher sections"
	                       sections={sections}
	                       meta={{
		                       label: "Patcher guide",
		                       value: version,
		                       className: styles.sidebar_meta
	                       }}/>;
}
