import FontAwesome from "@/components/font-awesome";
import styles from "@s/search.module.css";

export default function SearchPageMessage({ icon, text }: Readonly<{ icon: string, text: string }>) {
	return (
		<div className={styles.message}>
			<FontAwesome prefix="fad" name={icon}/>
			<p>{text}</p>
		</div>
	);
}
