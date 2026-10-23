import Image from "next/image";
import type { MouseEvent } from "react";
import Tooltip from "@/components/tooltip";
import MedalInfo from "@/components/profile/medal-info";
import EmptyAchievementSlot from "@/components/profile/empty-achievement-slot";
import { getCustomAchievementImageUrl, type CustomAchievement } from "@/lib/custom-achievements";
import styles from "@s/profile.module.css";

export default function CustomAchievementSlot({ achievement, index, canRevealSecretConditions, onSlotClick, activeSlot, disabled, draggable = false }: Readonly<{
	achievement?: CustomAchievement | null;
	index: number;
	canRevealSecretConditions: boolean;
	onSlotClick?: (index: number, event: MouseEvent<HTMLButtonElement>) => void;
	activeSlot?: number;
	disabled: boolean;
	draggable?: boolean;
}>) {
	const medal = achievement
		? <Image src={getCustomAchievementImageUrl(achievement.filename)} alt={achievement.name} fill sizes="90px" draggable={false}/>
		: <EmptyAchievementSlot/>;
	const content = onSlotClick ? <button type="button" className={styles.custom_achievement_slot_button} disabled={disabled} draggable={draggable}
		aria-label={achievement ? `Change medal in slot ${index + 1}: ${achievement.name}` : `Choose medal for slot ${index + 1}`}
		aria-haspopup="dialog" aria-expanded={activeSlot === index} onClick={(event) => onSlotClick(index, event)}>
		{medal}
	</button> : medal;
	return achievement ? <Tooltip className={styles.custom_achievement_medal} tooltipClassName={styles.achievement_tooltip} portal bubble focusable={!onSlotClick}
		description={<MedalInfo name={achievement.name} description={achievement.description} condDescription={achievement.condDescription}
			showCondition={!achievement.filename.startsWith("hide-") || canRevealSecretConditions}/> }>
		{content}
	</Tooltip> : content;
}
