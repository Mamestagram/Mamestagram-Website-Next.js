import LoadingTitle from "@/components/profile/loading-title";
import styles from "@s/profile.module.css";

export default function PlayerScoresLoading({ label, hasGrade = true, showTitle = true }: {
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
