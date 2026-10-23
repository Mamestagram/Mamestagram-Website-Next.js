"use client";

import classNames from "classnames";
import { useRef, useState, type MouseEvent } from "react";
import CustomAchievementSlot from "@/components/profile/custom-achievement-slot";
import { MAX_CUSTOM_ACHIEVEMENTS, type CustomAchievementSelection } from "@/lib/custom-achievements";
import styles from "@s/profile.module.css";

export default function CustomAchievementSlots({ achievements, preview = false, canRevealSecretConditions = false, onSlotClick, onReorder, activeSlot, disabled = false }: Readonly<{
	achievements: CustomAchievementSelection;
	preview?: boolean;
	canRevealSecretConditions?: boolean;
	onSlotClick?: (index: number, event: MouseEvent<HTMLButtonElement>) => void;
	onReorder?: (from: number, to: number) => void;
	activeSlot?: number;
	disabled?: boolean;
}>) {
	const dragSource = useRef<number | null>(null);
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [dropIndex, setDropIndex] = useState<number | null>(null);
	const clearDrag = () => {
		dragSource.current = null;
		setDraggedIndex(null);
		setDropIndex(null);
	};
	return <ul className={classNames(styles.custom_achievement_slots, { [styles.custom_achievement_slots_preview]: preview })} aria-label="Featured achievement slots">
		{Array.from({ length: MAX_CUSTOM_ACHIEVEMENTS }, (_, index) => {
			const achievement = achievements[index];
			return <li className={styles.custom_achievement_slot} data-empty={!achievement} key={index}
				data-dragging={draggedIndex === index} data-drop-target={dropIndex === index && draggedIndex !== index}
				onDragStart={(event) => {
					event.stopPropagation();
					if (disabled || !onReorder || !achievement) { event.preventDefault(); return; }
					dragSource.current = index;
					setDraggedIndex(index);
					event.dataTransfer.effectAllowed = "move";
					event.dataTransfer.setData("text/featured-achievement", String(achievement.id));
				}}
				onDragOver={(event) => {
					if (disabled || !onReorder || dragSource.current === null) return;
					event.preventDefault(); event.stopPropagation();
					event.dataTransfer.dropEffect = "move";
					setDropIndex(index);
				}}
				onDragLeave={(event) => {
					if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setDropIndex(null);
				}}
				onDrop={(event) => {
					if (dragSource.current === null) return;
					event.preventDefault(); event.stopPropagation();
					const from = dragSource.current;
					clearDrag();
					if (!disabled) onReorder?.(from, index);
				}}
				onDragEnd={(event) => { event.stopPropagation(); clearDrag(); }}
				aria-label={achievement ? undefined : `Empty achievement slot ${index + 1}`}>
				<CustomAchievementSlot achievement={achievement} index={index} canRevealSecretConditions={canRevealSecretConditions}
					onSlotClick={onSlotClick} activeSlot={activeSlot} disabled={disabled} draggable={!!achievement && !!onReorder && !disabled}/>
			</li>;
		})}
	</ul>;
}
