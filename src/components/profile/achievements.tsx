import classNames from "classnames";
import { getUserAchievements } from "@/database/profile";
import type { ModeNum } from "@/lib/mode";
import FontAwesome from "@/components/font-awesome";
import AchievementCollection from "./achievement-collection";
import AchievementItems from "./achievement-items";
import styles from "@s/profile.module.css";

export default async function Achievements({ id, mode, canRevealSecretConditions }: Readonly<{
	id: number,
	mode: ModeNum,
	canRevealSecretConditions: boolean
}>) {
	const achievements = await getUserAchievements(id, mode);
	
	return (
		<div className={classNames(styles.section_box, styles.achievements)} data-page-enter="box">
			<h1 className={styles.section_title}>
				<FontAwesome prefix="fad" name="award"/>
				Achievements
			</h1>
			<div className={styles.medal_container}>
				<AchievementCollection achievements={achievements}/>
				<h2>Skill</h2>
				<AchievementItems medals={achievements.skill}
				                  canRevealSecretConditions={canRevealSecretConditions}/>
				<h2>Mod</h2>
				<AchievementItems medals={achievements.mod}
				                  canRevealSecretConditions={canRevealSecretConditions}/>
				<h2>Mamestagram</h2>
				<AchievementItems medals={achievements.others}
				                  canRevealSecretConditions={canRevealSecretConditions}/>
			</div>
		</div>
	);
}
