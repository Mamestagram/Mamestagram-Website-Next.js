import styles from "@s/profile.module.css";

export default function MedalInfo({ name, description, condDescription, showCondition = true }: Readonly<{
	name: string,
	description: string,
	condDescription: string,
	showCondition?: boolean
}>) {

	return (
		<>
			<span className={styles.medal_name}>{name}</span>
			<span className={styles.medal_description}>{description}</span>
			{showCondition &&
				<span className={styles.medal_cond_description}>{condDescription}</span>}
		</>
	);
}
