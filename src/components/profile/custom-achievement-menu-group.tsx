import Image from "next/image";
import Tooltip from "@/components/tooltip";
import { getCustomAchievementImageUrl, type CustomAchievement, type CustomAchievementIds } from "@/lib/custom-achievements";
import styles from "@s/profile.module.css";

export default function CustomAchievementMenuGroup({ label, achievements, selectedIds, slotIndex, disabled, onSelect }: Readonly<{
	label: string;
	achievements: CustomAchievement[];
	selectedIds: CustomAchievementIds;
	slotIndex: number;
	disabled: boolean;
	onSelect: (id: number) => void;
}>) {
	return <section className={styles.custom_achievement_menu_group} aria-label={label}>
		<h4>{label}</h4>
		<ul className={styles.custom_achievement_menu_list}>
			{achievements.map((achievement) => {
				const selected = selectedIds[slotIndex] === achievement.id;
				return <li key={achievement.id}>
					<Tooltip className={styles.custom_achievement_menu_medal} tooltipClassName={styles.custom_achievement_menu_tooltip} portal bubble focusable={false} description={achievement.name}>
						<button type="button" disabled={disabled}
							aria-label={achievement.name} aria-pressed={selected} onClick={() => onSelect(achievement.id)}>
							<Image src={getCustomAchievementImageUrl(achievement.filename)} alt={achievement.name} width={48} height={48} draggable={false}/>
						</button>
					</Tooltip>
				</li>;
			})}
		</ul>
	</section>;
}
