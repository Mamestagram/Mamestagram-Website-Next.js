import FontAwesome from "@/components/font-awesome";
import styles from "@s/support.module.css";

export default function SupportSectionHeading({ icon, title }: { icon: string, title: string }) {
	return (
		<div className={styles.section_heading}>
			<i><FontAwesome prefix="fad" name={icon}/></i>
			<h2>{title}</h2>
		</div>
	);
}
