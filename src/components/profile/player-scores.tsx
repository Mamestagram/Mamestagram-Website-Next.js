import classNames from "classnames";
import Image from "next/image";
import type { ScoreScope } from "@/database/profile";
import { getPlayerScores } from "@/database/profile";
import styles from "@s/profile.module.css";
import { ModeNum } from "@/lib/mode";

export default async function PlayerScores({ scope, id, mode, isDans }: {
	scope: ScoreScope,
	id: number,
	mode: ModeNum,
	isDans: boolean
}) {
	const playerScores = await getPlayerScores(scope, id, mode, isDans);
	
	return (
		<div className={classNames(styles.section_box, styles.list_container)}>
			<h1>
				{scope === "bestPP" && "Best Performance"}
				{scope === "firstPlace" && "First Place Ranks"}
				{scope === "recentPlayed" && "Recent Played Maps"}
			</h1>
			<div className={styles.score_list}>
				{playerScores.length === 0 && <h2 className={styles.no_scores}>No scores available</h2>}
				{playerScores.map((map, i) => (
					<div key={i} className={styles.score}>
						{map.set_id > 0 &&
							<Image className={styles.map_bg}
							       src={`https://assets.ppy.sh/beatmaps/${map.set_id}/covers/cover.jpg?`}
							       alt="map bg"
							       fill
							       loading="eager"
							       unoptimized
							       draggable={false}
							       sizes="(max-width: 768px) 100vw, 50vw"/>}
						<span className={styles.grade}>
							<Image src={`/images/grade/${map.grade}.png`}
							       alt="grade"
							       fill
							       draggable={false}
							       sizes="(max-width: 768px) 100vw, 50vw"/>
						</span>
						<span className={styles.meta}>
							<h2>
								<span className={styles.title}>{map.title}</span>
								<span className={styles.version}>{map.version}</span>
							</h2>
							<p>mapped by {map.creator}</p>
						</span>
						<p className={styles.pp}>
							<span className={styles.recorded}>
								{Math.round(map.pp)}<span className={styles.pp_label}>pp</span>
							</span>
							{scope === "bestPP" && <span className={styles.weighted}>({Math.round(map.pp * 0.95 ** i)}pp)</span>}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}