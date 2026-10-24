import FontAwesome from "@/components/font-awesome";
import HomePlayerCount from "@/components/home/home-player-count";
import type { HomePlayerCounts } from "@/database/home";
import styles from "@s/home.module.css";

export default function HomeStat({ icon, label, kind, tone }: Readonly<{
	icon: string;
	label: string;
	kind: keyof HomePlayerCounts;
	tone: "stable" | "lazer" | "players";
}>) {
	return <div className={styles.stat_item} data-tone={tone}>
		<span className={styles.stat_icon}><FontAwesome prefix="fad" name={icon}/></span>
		<span className={styles.stat_copy}>
			<small>{label}</small>
			<strong><HomePlayerCount kind={kind}/></strong>
		</span>
	</div>;
}
