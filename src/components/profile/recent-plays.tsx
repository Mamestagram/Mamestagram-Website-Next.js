import classNames from "classnames";
import style from "@s/profile.module.css";

export default function RecentPlays() {
	return (
		<div className={classNames(style.section_box, "recent-plays-section")}>
			<div className="section-title">Recent Plays</div>
			<div className="item-list">
				<div className="list-item">
					<div className="list-item-title">Blue Zenith</div>
					<div className="list-item-meta">4/22 New Top Play achieved</div>
				</div>
				<div className="list-item">
					<div className="list-item-title">Everything will freeze</div>
					<div className="list-item-meta">4/20 Accuracy milestone reached: 98.4%</div>
				</div>
				<div className="list-item">
					<div className="list-item-title">Multiplayer Session</div>
					<div className="list-item-meta">4/18 Joined weekend lobby</div>
				</div>
			</div>
		</div>
	);
}