import classNames from "classnames";
import style from "@s/profile.module.css";

export default function Statistics() {
	return (
		<div className={classNames(style.section_box, style.statistics)}>
			<div className="section-title">Statistics</div>
			<div className="stats-grid">
				<div className="stat-box">
					<div className="stat-label">Global Rank</div>
					<div className="stat-value">#12,408</div>
				</div>
				<div className="stat-box">
					<div className="stat-label">Country Rank</div>
					<div className="stat-value">#842</div>
				</div>
				<div className="stat-box">
					<div className="stat-label">Play Count</div>
					<div className="stat-value">18,240</div>
				</div>
				<div className="stat-box">
					<div className="stat-label">Accuracy</div>
					<div className="stat-value">98.41%</div>
				</div>
			</div>
		</div>
	);
}