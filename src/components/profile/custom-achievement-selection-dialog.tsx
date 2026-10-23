"use client";

import { useEffect, useId, type ReactNode } from "react";
import CustomAchievementMenu from "@/components/profile/custom-achievement-menu";
import ProfileUiSettingsDialog from "@/components/settings/profile-ui-settings-dialog";
import { setCustomAchievementSlot, type CustomAchievement, type CustomAchievementIds } from "@/lib/custom-achievements";
import type { PopoverAnchor } from "@/lib/popover-position";
import styles from "@s/profile.module.css";
import settingsStyles from "@s/settings.module.css";

export default function CustomAchievementSelectionDialog({ achievements, selectedIds, slotIndex, position, disabled, onChange, onClose, children }: Readonly<{
	achievements: CustomAchievement[];
	selectedIds: CustomAchievementIds;
	slotIndex: number;
	position: PopoverAnchor;
	disabled: boolean;
	onChange: (ids: CustomAchievementIds) => void;
	onClose: () => void;
	children?: ReactNode;
}>) {
	const titleId = useId();
	useEffect(() => {
		const onEscape = (event: KeyboardEvent) => {
			if (event.key !== "Escape" || event.defaultPrevented) return;
			event.preventDefault();
			event.stopPropagation();
			if (!disabled) onClose();
		};
		window.addEventListener("keydown", onEscape, true);
		return () => window.removeEventListener("keydown", onEscape, true);
	}, [disabled, onClose]);
	return <ProfileUiSettingsDialog className={styles.custom_achievement_menu_dialog}
		title={`Select medal · Slot ${slotIndex + 1}`}
		eyebrow="Featured achievements" titleId={titleId} closeLabel="Close medal list" position={position} keepInViewport onClose={onClose}>
		<CustomAchievementMenu key={slotIndex} achievements={achievements} selectedIds={selectedIds} slotIndex={slotIndex} disabled={disabled}
			onSelect={(id) => onChange(setCustomAchievementSlot(selectedIds, slotIndex, id))}/>
		{children}
		{selectedIds[slotIndex] != null && <div className={styles.custom_achievement_editor_actions}>
			<button type="button" className={settingsStyles.secondary_button} disabled={disabled}
				onClick={() => onChange(setCustomAchievementSlot(selectedIds, slotIndex, null))}>Remove medal</button>
		</div>}
	</ProfileUiSettingsDialog>;
}
