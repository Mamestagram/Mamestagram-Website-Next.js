import classNames from "classnames";
import style from "@s/profile.module.css";

export default function FirstPlace() {
	return (
		<div className={classNames(style.section_box, "first-place-section")}>
			<div className="section-title">First Place</div>
			<div className="item-list">
				<div className="list-item">
					<div className="list-item-title">National #1 on a favorite technical map</div>
					<div className="list-item-meta">Pinned achievement for profile identity</div>
				</div>
				<div className="list-item">
					<div className="list-item-title">Community event winning score recorded last month</div>
					<div className="list-item-meta">Strongest tournament-style result</div>
				</div>
				<div className="list-item">
					<div className="list-item-title">Seasonal leaderboard first place</div>
					<div className="list-item-meta">Good area for crowns, badges, and milestone records</div>
				</div>
			</div>
		</div>
	);
}