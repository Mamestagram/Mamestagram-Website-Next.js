import styles from "@s/leaderboard.module.css";

export default function RankingListLoading() {
	return (
		<div className={styles.ranking_list_loading} data-page-enter="box" role="status" aria-label="Loading leaderboard rankings">
			<div className={styles.ranking_pages_loading} aria-hidden="true">
				{Array.from({ length: 7 }, (_, index) => <i key={index}/>) }
			</div>
			<div className={styles.table_wrapper}>
				<div className={styles.ranking_header_loading} aria-hidden="true">
					<i/><i/><i/><i/><i/>
				</div>
				<div className={styles.ranking_rows_loading} aria-hidden="true">
					{Array.from({ length: 10 }, (_, index) =>
						<div key={index}>
							<span className={styles.ranking_rank_loading}/>
							<span className={styles.ranking_avatar_loading}/>
							<span className={styles.ranking_name_loading}><i/><i/></span>
							<span className={styles.ranking_value_loading}/>
							<span className={styles.ranking_value_loading}/>
						</div>)}
				</div>
			</div>
		</div>
	);
}
