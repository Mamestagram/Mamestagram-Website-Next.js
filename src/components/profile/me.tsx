import classNames from "classnames";
import style from "@s/profile.module.css";

export default function AboutMe({ bbCode }: { bbCode: string }) {
	return (
		<div className={classNames(style.section_box, "about-me-section")}>
			<h1>About Me</h1>
			<div className="userpage-content">
				{bbCode}{/* TODO BBCodeParser未完成 */}
			</div>
		</div>
	);
}