import BackToTop from "@/components/back-to-top";
import styles from "@s/support.module.css";

export default function SupportBackToTop({ label }: Readonly<{ label: string }>) {
	return <BackToTop className={styles.back_to_top} label={label}/>;
}
