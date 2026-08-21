import SectionHeading from "@/components/section-heading";
import styles from "@s/patcher.module.css";

export default function PatcherSectionHeading({ icon, title, prefix }: Readonly<{
	icon: string,
	title: string,
	prefix?: "fad" | "fab"
}>) {
	return <SectionHeading className={styles.section_heading} icon={icon} title={title} prefix={prefix}/>;
}
