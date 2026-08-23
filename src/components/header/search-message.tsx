import FontAwesome from "@/components/font-awesome";
import styles from "@s/header-search.module.css";

export default function SearchMessage({ icon, title, body }: {
	icon: string,
	title?: string,
	body: string
}) {
	return (
		<div className={styles.message}>
			<FontAwesome prefix="fad" name={icon}/>
			{title && <strong>{title}</strong>}
			<p>{body}</p>
		</div>
	);
}
