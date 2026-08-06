import FontAwesome from "@/components/font-awesome";
import styles from "@s/documents.module.css";

export default function SupportNotice({ icon, title, body, emphasis, href }: {
	icon: string,
	title: string,
	body: string,
	emphasis?: string,
	href: string
}) {
	return (
		<div className={styles.notice}>
			<FontAwesome prefix="fad" name={icon}/>
			<span>
				<strong>{title}</strong>
				<p>{body}{emphasis && <> <strong className={styles.notice_emphasis}>{emphasis}</strong></>}</p>
			</span>
			<a href={href} target="_blank" rel="noopener noreferrer">
				# support <FontAwesome prefix="fas" name="arrow-up-right"/>
			</a>
		</div>
	);
}
