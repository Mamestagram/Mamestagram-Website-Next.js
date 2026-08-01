import Image from "next/image";
import styles from "@s/leaderboard.module.css";

export default function LeaderboardHero() {
	return (
		<section className={styles.hero}>
			<Image className={styles.hero_image}
			       src="/images/banner/leaderboard.jpg"
			       alt=""
			       draggable={false}
			       fill
			       sizes="100vw"
			       priority/>
			<div className={styles.hero_overlay}></div>
			<div className={styles.hero_content}>
				<h1>Leaderboard</h1>
				<p>Rankings across every mode and playstyle.</p>
			</div>
		</section>
	);
}
