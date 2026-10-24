import HomeStat from "@/components/home/home-stat";
import styles from "@s/home.module.css";

export default function HomeLiveStats() {
	return <div className={styles.stats_grid} data-theme-independent="true">
		<HomeStat icon="computer-mouse" label="Stable online" kind="stable" tone="stable"/>
		<HomeStat icon="rocket-launch" label="Lazer online" kind="lazer" tone="lazer"/>
		<HomeStat icon="users" label="Registered players" kind="total" tone="players"/>
	</div>;
}
