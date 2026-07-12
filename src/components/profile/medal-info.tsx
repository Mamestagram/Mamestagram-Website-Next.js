import { Medal } from "@/database/profile";
import styles from "@s/profile.module.css";

export default function MedalInfo({ medal }: { medal: Medal }) {
	return (
		<>
			<span className={styles.medal_name}>{medal.name}</span>
			<span className={styles.medal_description}>{medal.description}</span>
			<span className={styles.medal_cond_description}>{medal.condDescription}</span>
		</>
	);
}