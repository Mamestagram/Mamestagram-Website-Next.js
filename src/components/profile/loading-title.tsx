import styles from "@s/profile.module.css";

export default function LoadingTitle({ label }: { label: string }) {
	return (
		<div className={styles.suspense_loading_title}>
			<span className={styles.suspense_loading_icon}/>
			<strong>{label}</strong>
			<span className={styles.suspense_loading_dots} aria-hidden="true">
				<i/><i/><i/>
			</span>
		</div>
	);
}
