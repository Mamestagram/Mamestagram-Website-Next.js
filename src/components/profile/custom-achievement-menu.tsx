"use client";

import { useState } from "react";
import CustomAchievementMenuGroup from "@/components/profile/custom-achievement-menu-group";
import { customAchievementCategories, getCustomAchievementCategory, type CustomAchievement, type CustomAchievementIds } from "@/lib/custom-achievements";
import styles from "@s/profile.module.css";

export default function CustomAchievementMenu({ achievements, selectedIds, slotIndex, disabled, onSelect }: Readonly<{
	achievements: CustomAchievement[];
	selectedIds: CustomAchievementIds;
	slotIndex: number;
	disabled: boolean;
	onSelect: (id: number) => void;
}>) {
	const [search, setSearch] = useState("");
	const filtered = achievements.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase()));
	return <div className={styles.custom_achievement_menu}>
		<label>Search earned medals
			<input type="search" value={search} onChange={(event) => setSearch(event.currentTarget.value)} disabled={disabled} autoFocus/>
		</label>
		<div className={styles.custom_achievement_menu_groups}>
			{customAchievementCategories.map(({ value, label }) => {
				const medals = filtered.filter((achievement) => getCustomAchievementCategory(achievement.filename) === value);
				return medals.length > 0 && <CustomAchievementMenuGroup key={value} label={label} achievements={medals} selectedIds={selectedIds} slotIndex={slotIndex} disabled={disabled} onSelect={onSelect}/>;
			})}
		</div>
		{filtered.length === 0 && <p>{achievements.length === 0 ? "No earned medals yet." : "No matching medals."}</p>}
	</div>;
}
