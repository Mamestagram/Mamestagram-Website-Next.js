import styles from "@s/profile.module.css";

function LoadingTitle({ label }: { label: string }) {
	return (
		<div className={styles.suspense_loading_title}>
			<span className={styles.suspense_loading_icon}/>
			<strong>{label}</strong>
			<span className={styles.suspense_loading_dots} aria-hidden="true">
				<i/><i/><i/>
			</span>
		</div>
	);
}

export function StatisticsLoading() {
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

export function PlayerScoresLoading({ label, hasGrade = true, showTitle = true }: {
	label: string,
	hasGrade?: boolean,
	showTitle?: boolean
}) {
	return (
		<div className={styles.player_scores_loading} role="status" aria-label={`Loading ${label}`}>
			{showTitle && <LoadingTitle label={label}/>}
			<div className={styles.score_loading_list}>
				{Array.from({ length: 5 }, (_, index) =>
					<div key={index} className={styles.score_loading_row}>
						{hasGrade && <span className={styles.score_loading_grade}/>}
						<span className={styles.score_loading_meta}>
							<i/><i/>
						</span>
						<span className={styles.score_loading_metric}>
							<i/><i/>
						</span>
					</div>)}
			</div>
		</div>
	);
}
