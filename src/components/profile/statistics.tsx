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
				<section className={classNames(styles.stat_group, styles.ranking_group)}>
					<h2 className={styles.stat_group_title}>Ranking</h2>
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
				</section>

				<section className={classNames(styles.stat_group, styles.grade_group)}>
					<h2 className={styles.stat_group_title}>Grade Count</h2>
					<ul className={styles.grade_count_area}>
						{Object.entries(statistics.gradeCount).map(([key, value]) =>
							<li key={key} data-grade={key}>
								<h3>{key.toUpperCase()}</h3>
								<p>{value.toLocaleString()}</p>
							</li>
						)}
					</ul>
				</section>

				<section className={classNames(styles.stat_group, styles.performance_group)}>
					<h2 className={styles.stat_group_title}>Performance</h2>
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
				</section>

				<section className={classNames(styles.stat_group, styles.score_group)}>
					<h2 className={styles.stat_group_title}>Score</h2>
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
				</section>

				<section className={classNames(styles.stat_group, styles.details_group)}>
					<h2 className={styles.stat_group_title}>Other Details</h2>
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
				</section>
			</div>
		</>
	);
}
