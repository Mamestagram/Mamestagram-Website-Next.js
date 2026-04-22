import classNames from "classnames";
import style from "@s/profile.module.css";

export default function CurrentGoal() {
	return (
		<div className={classNames(style.section_box, "goal-section")}>
			<div>
				<h2>Current Goal</h2>
				<div className="goal-main">10,000ppまで<br/>あと 640pp</div>
				<div className="sub">今月は安定性よりも高難易度更新を優先。</div>
			</div>
			
			<div>
				<div className="goal-bar">
					<div className="goal-fill"></div>
				</div>
				<div className="sub">Progress 72%</div>
			</div>
		</div>
	);
}