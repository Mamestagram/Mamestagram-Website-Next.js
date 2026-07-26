"use client";

import { useUserContext } from "@/components/context/user-provider";
import styles from "@s/profile.module.css";

export default function MedalInfo({ userId = 0, name, filename = "", description, condDescription }: {
	userId?: number,
	name: string,
	filename?: string,
	description: string,
	condDescription: string
}) {
	const { userInfo } = useUserContext();
	
	return (
		<>
			<span className={styles.medal_name}>{name}</span>
			<span className={styles.medal_description}>{description}</span>
			{(!(/^hide-/).test(filename) || (userInfo.isLoggedIn && userId === userInfo.id)) &&
				<span className={styles.medal_cond_description}>{condDescription}</span>}
		</>
	);
}