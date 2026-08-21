import BackToTop from "@/components/back-to-top";
import styles from "@s/documents.module.css";

export default function DocumentsBackToTop({ label }: Readonly<{ label: string }>) {
	return <BackToTop className={styles.back_to_top} label={label}/>;
}
