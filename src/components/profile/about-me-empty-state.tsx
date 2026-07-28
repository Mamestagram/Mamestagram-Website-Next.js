import FontAwesome from "@/components/font-awesome";
import styles from "@s/profile.module.css";

export default function AboutMeEmptyState({ canEdit = false }: { canEdit?: boolean }) {
	return (
		<div className={styles.about_me_empty} data-owner={canEdit}>
			<span className={styles.about_me_empty_icon}>
				<FontAwesome prefix="fad" name="quote-left"/>
			</span>
			<span className={styles.about_me_empty_copy}>
				<strong>{canEdit ? "Make this space yours" : "Nothing here yet"}</strong>
				<small>
					{canEdit
						? "Share your playstyle, favorite maps, achievements, or anything about you."
						: "This player has not written an introduction yet."}
				</small>
			</span>
			{canEdit &&
				<span className={styles.about_me_empty_hint}>
					<FontAwesome prefix="fas" name="arrow-up"/>
					Use Edit to start writing
				</span>}
		</div>
	);
}
