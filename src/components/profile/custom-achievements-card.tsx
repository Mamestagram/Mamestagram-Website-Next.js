import classNames from "classnames";
import type { ComponentProps, ReactNode } from "react";
import FontAwesome from "@/components/font-awesome";
import CustomAchievementSlots from "@/components/profile/custom-achievement-slots";
import { MAX_CUSTOM_ACHIEVEMENTS, type CustomAchievementSelection } from "@/lib/custom-achievements";
import styles from "@s/profile.module.css";

export default function CustomAchievementsCard({ achievements, canRevealSecretConditions = false, onSlotClick, onReorder, activeSlot, disabled, children }: Readonly<{
	achievements: CustomAchievementSelection;
	canRevealSecretConditions?: boolean;
	onSlotClick?: ComponentProps<typeof CustomAchievementSlots>["onSlotClick"];
	onReorder?: ComponentProps<typeof CustomAchievementSlots>["onReorder"];
	activeSlot?: number;
	disabled?: boolean;
	children?: ReactNode;
}>) {
	return <div className={classNames(styles.section_box, styles.custom_achievements)} data-page-enter="box">
		<h1 className={styles.section_title}><FontAwesome prefix="fad" name="medal"/><span className={styles.custom_achievement_title}>Featured achievements</span>
			<small className={styles.custom_achievement_count}>{Math.min(achievements.filter(Boolean).length, MAX_CUSTOM_ACHIEVEMENTS)}/{MAX_CUSTOM_ACHIEVEMENTS}</small>
		</h1>
		<CustomAchievementSlots achievements={achievements} canRevealSecretConditions={canRevealSecretConditions} onSlotClick={onSlotClick} onReorder={onReorder} activeSlot={activeSlot} disabled={disabled}/>
		{children}
	</div>;
}
