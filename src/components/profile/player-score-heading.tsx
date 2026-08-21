import styles from "@s/profile.module.css";

export default function PlayerScoreHeading({ artist, title }: {
	artist: string,
	title: string
}) {
	return (
		<h2 className={styles.map_heading}>
			<span className={styles.artist} data-score-tooltip={artist}>{artist}</span>
			<span className={styles.heading_separator}>—</span>
			<span className={styles.title} data-score-tooltip={title}>{title}</span>
		</h2>
	);
}
