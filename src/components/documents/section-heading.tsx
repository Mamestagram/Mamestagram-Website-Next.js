import SectionHeading from "@/components/section-heading";
import styles from "@s/documents.module.css";

export default function DocumentsSectionHeading({ icon, title }: Readonly<{ icon: string, title: string }>) {
	return <SectionHeading className={styles.section_heading} icon={icon} title={title}/>;
}
