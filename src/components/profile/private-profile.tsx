import classNames from "classnames";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/profile.module.css";

export default function PrivateProfile() {
	return (
		<div className={styles.profile_page}>
			<div className={classNames(styles.container, styles.private_profile_container)}>
				<div className={classNames(styles.section_box, styles.private_profile_card)} data-page-enter="box">
					<span className={styles.private_profile_icon} aria-hidden="true">
						<FontAwesome prefix="fad" name="lock"/>
					</span>
					<p>This profile is private.</p>
				</div>
			</div>
		</div>
	);
}
