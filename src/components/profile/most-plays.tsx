import classNames from "classnames";
import style from "@s/profile.module.css";

export default function MostPlays() {
	return (
		<div className={classNames(style.section_box, "most-plays-section")}>
			<div className="section-title">Most Plays</div>
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