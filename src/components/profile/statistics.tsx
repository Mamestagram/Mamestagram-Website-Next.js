import classNames from "classnames";
import { getStatistics } from "@/database/profile";
import { ModeNum } from "@/lib/mode";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/profile.module.css";

export default async function Statistics({ id, mode, isClan, isDans }: {
	id: number,
	mode: ModeNum,
	isClan: boolean,
	isDans: boolean
}) {
	const statistics = await getStatistics(id, mode, isClan, isDans);
	
	return (
		<>
			<h1 className={styles.section_title}>
				<FontAwesome prefix="fad" name="chart-pie"/>
				Statistics
			</h1>
			<div className={styles.stat_container}>
				<h2>Ranking</h2>
				<ul className={styles.rank_area}>
					<li>
						<h3>Global Rank</h3>
						<p>#{statistics.rank.global.toLocaleString()}</p>
					</li>
					<li>
						<h3>Country Rank</h3>
						<p>#{statistics.rank.country.toLocaleString()}</p>
					</li>
					<li>
						<h3>Bancho Rank</h3>
						<p>#{statistics.rank.bancho.toLocaleString()}</p>
					</li>
				</ul>
				<h2>Grade Count</h2>
				<ul className={styles.grade_count_area}>
					{Object.entries(statistics.gradeCount).map(([key, value]) =>
						<li key={key}>
							<h3>{key} count</h3>
							<p>{value.toLocaleString()}</p>
						</li>
					)}
				</ul>
				<h2>Performance</h2>
				<ul className={styles.pp_area}>
					<li>
						<h3>Overall</h3>
						<p>{statistics.pp.default.toLocaleString()}<span>pp</span></p>
					</li>
					{mode === ModeNum.mania &&
						<>
							<li>
								<h3>4k</h3>
								<p>{statistics.pp.k4.toLocaleString()}<span>pp</span></p>
							</li>
							<li>
								<h3>6k</h3>
								<p>{statistics.pp.k6.toLocaleString()}<span>pp</span></p>
							</li>
							<li>
								<h3>7k</h3>
								<p>{statistics.pp.k7.toLocaleString()}<span>pp</span></p>
							</li>
							<li>
								<h3>10k</h3>
								<p>{statistics.pp.k10.toLocaleString()}<span>pp</span></p>
							</li>
						</>}
				</ul>
				<h2>Score</h2>
				<ul className={styles.score_area}>
					<li>
						<h3>Ranked Score</h3>
						<p>{statistics.rankedScore.toLocaleString()}</p>
					</li>
					<li>
						<h3>Total Score</h3>
						<p>{statistics.totalScore.toLocaleString()}</p>
					</li>
				</ul>
				<h2>Other Details</h2>
				<ul className={styles.others_area}>
					<li>
						<h3>Hit Accuracy</h3>
						<p>{statistics.acc.toFixed(2)}<span>%</span></p>
					</li>
					<li>
						<h3>Play Count</h3>
						<p>{statistics.plays.toLocaleString()}</p>
					</li>
					<li>
						<h3>Total Play Time</h3>
						<p>
							{statistics.playtime.days}<span>d</span>{" "}
							{statistics.playtime.hours}<span>h</span>{" "}
							{statistics.playtime.minutes}<span>m</span>
						</p>
					</li>
					<li>
						<h3>Total Hits</h3>
						<p>{statistics.totalHits.toLocaleString()}</p>
					</li>
					<li>
						<h3>Max Combo</h3>
						<p>{statistics.maxCombo.toLocaleString()}</p>
					</li>
				</ul>
			</div>
		</>
	);
}