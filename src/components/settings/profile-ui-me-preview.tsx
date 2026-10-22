import styles from "@s/settings.module.css";

export default function ProfileUiMePreview() {
	return (
		<div className={styles.profile_ui_preview_me} aria-hidden="true">
			{Array.from({ length: 3 }, (_, index) => (
				<div className={styles.profile_ui_preview_me_section} key={index}>
					<span className={styles.profile_ui_preview_me_heading}/>
					<div className={styles.profile_ui_preview_me_paragraph}>
						<span/>
						<span/>
						<span/>
					</div>
				</div>
			))}
		</div>
	);
}
