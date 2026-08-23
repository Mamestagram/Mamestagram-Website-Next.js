import FontAwesome from "@/components/font-awesome";
import styles from "@s/profile.module.css";

export default function StatisticsUnavailable() {
	return (
		<>
			<h1 className={styles.section_title}>
				<FontAwesome prefix="fad" name="chart-pie"/>
				Statistics
			</h1>
			<div className={styles.statistics_unavailable} role="status">
				<FontAwesome prefix="fad" name="triangle-exclamation"/>
				<div>
					<strong>Statistics unavailable</strong>
					<p>Player statistics could not be loaded. Please try again later.</p>
				</div>
			</div>
		</>
	);
}
