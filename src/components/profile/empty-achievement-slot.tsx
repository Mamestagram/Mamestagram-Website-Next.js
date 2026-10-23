import styles from "@s/profile.module.css";

export default function EmptyAchievementSlot() {
	return <span className={styles.custom_achievement_empty} aria-hidden="true">
		<svg viewBox="0 0 193 210" focusable="false">
			<path d="M80 12 Q96.5 2.5 113 12 L166 42 Q185.5 53 185.5 75 V135 Q185.5 157 166 168 L113 198 Q96.5 207.5 80 198 L27 168 Q7.5 157 7.5 135 V75 Q7.5 53 27 42 Z"/>
		</svg>
		<span>Empty</span>
	</span>;
}
