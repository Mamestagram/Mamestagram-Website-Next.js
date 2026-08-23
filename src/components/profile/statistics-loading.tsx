import LoadingTitle from "@/components/profile/loading-title";
import styles from "@s/profile.module.css";

export default function StatisticsLoading() {
	return (
		<div className={styles.statistics_loading} role="status" aria-label="Loading statistics">
			<LoadingTitle label="Statistics"/>
			<div className={styles.statistics_loading_grid}>
				{[3, 5, 3, 2, 5].map((amount, groupIndex) =>
					<section key={groupIndex} className={styles.statistics_loading_group}>
						<span className={styles.skeleton_group_title}/>
						<div>
							{Array.from({ length: amount }, (_, itemIndex) =>
								<span key={itemIndex} className={styles.skeleton_stat_card}>
									<i/><i/>
								</span>)}
						</div>
					</section>)}
			</div>
		</div>
	);
}
