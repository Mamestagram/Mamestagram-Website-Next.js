import BackToTop from "@/components/back-to-top";
import styles from "@s/patcher.module.css";

export default function PatcherBackToTop() {
	return <BackToTop className={styles.back_to_top} label="Back to top"/>;
}
