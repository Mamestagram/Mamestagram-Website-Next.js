import classNames from "classnames";
import { getMostPlayedMaps } from "@/database/profile";
import { ModeNum } from "@/lib/mode";
import styles from "@s/profile.module.css";

export default async function MostPlayedMaps({ id, mode, isDans }: {
	id: number,
	mode: ModeNum,
	isDans: boolean
}) {
	const maps = await getMostPlayedMaps(id, mode, isDans);
	
	return (
		<div className={classNames(styles.section_box, styles.list_container)}>
			<h1>Most Played Maps</h1>
			{maps.length === 0 && <h2 className={styles.no_scores}>No scores available</h2>}
			<div className="item-list">
				<div className="list-item">
					<div className="list-item-title">Blue Zenith</div>
					<div className="list-item-meta">142 plays</div>
				</div>
				<div className="list-item">
					<div className="list-item-title">Freedom Dive</div>
					<div className="list-item-meta">126 plays</div>
				</div>
				<div className="list-item">
					<div className="list-item-title">The Deceit</div>
					<div className="list-item-meta">104 plays</div>
				</div>
			</div>
		</div>
	);
}