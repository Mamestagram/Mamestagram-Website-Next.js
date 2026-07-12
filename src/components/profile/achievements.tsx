import classNames from "classnames";
import { getUserAchievements } from "@/database/profile";
import { ModeNum } from "@/lib/mode";
import FontAwesome from "@/components/font-awesome";
import AchievementItems from "@/components/profile/achievement-items";
import styles from "@s/profile.module.css";

export default async function Achievements({ id, mode }: {
	id: number,
	mode: ModeNum
}) {
	const { status, medals } = await getUserAchievements(id, mode);
	
	return (
		<div className={classNames(styles.section_box, styles.achievements)}>
			<h1 className={styles.section_title}>
				<FontAwesome prefix="fad" name="award"/>
				Achievements
			</h1>
			<div className={styles.medal_container}>
				<h2>Skill</h2>
				<ul>
					<AchievementItems medals={medals.skill} collectStatus={status}/>
				</ul>
				<h2>Mod</h2>
				<ul>
					<AchievementItems medals={medals.mod} collectStatus={status}/>
				</ul>
				<h2>Mamestagram</h2>
				<ul>
					<AchievementItems medals={medals.others} collectStatus={status}/>
				</ul>
			</div>
		</div>
	);
}