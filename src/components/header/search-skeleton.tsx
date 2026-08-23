import styles from "@s/header-search.module.css";

export default function SearchSkeleton() {
	return (
		<ul className={styles.skeleton_list} aria-hidden="true">
			{Array.from({ length: 9 }, (_, index) =>
				<li key={index}>
					<span className={styles.skeleton_avatar}></span>
					<span className={styles.skeleton_identity}>
						<i></i>
						<i></i>
					</span>
					<span className={styles.skeleton_meta}>
						<span className={styles.skeleton_meta_primary}>
							<i></i>
							<i></i>
						</span>
						<i></i>
					</span>
				</li>)}
		</ul>
	);
}
