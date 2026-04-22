import classNames from "classnames";
import style from "@s/profile.module.css";

export default function BestPerformance() {
	return (
		<div className={classNames(style.section_box, "best-performance-section")}>
			<div className="section-title">Best Performance</div>
			<div className="performance-list">
				<div className="performance-item">
					<div className="score-rank">#1</div>
					<div>
						<div className="score-title">Freedom Dive [Another]</div>
						<div className="score-meta">98.72% / 2 miss / 245 BPM</div>
					</div>
					<div className="score-pp">612pp</div>
				</div>
				
				<div className="performance-item">
					<div className="score-rank">#2</div>
					<div>
						<div className="score-title">Blue Zenith [Extreme]</div>
						<div className="score-meta">97.91% / 1 miss / HDHR</div>
					</div>
					<div className="score-pp">598pp</div>
				</div>
				
				<div className="performance-item">
					<div className="score-rank">#3</div>
					<div>
						<div className="score-title">Everything will freeze [Extra]</div>
						<div className="score-meta">98.10% / FC / DT</div>
					</div>
					<div className="score-pp">581pp</div>
				</div>
				
				<div className="performance-item">
					<div className="score-rank">#4</div>
					<div>
						<div className="score-title">The Deceit [Insane]</div>
						<div className="score-meta">99.01% / FC / Nomod</div>
					</div>
					<div className="score-pp">560pp</div>
				</div>
			</div>
		</div>
	);
}