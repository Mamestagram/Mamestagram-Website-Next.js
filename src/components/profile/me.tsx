import classNames from "classnames";
import style from "@s/profile.module.css";

export default function AboutMe() {
	return (
		<div className={classNames(style.section_box, "about-me-section")}>
			<div className="about-badge">me!</div>
			<div>
				<div className="section-title">About Me</div>
				<div className="about-title">Competitive profileの間に、本人らしさを入れる領域</div>
				<div className="about-copy">
					実績や統計だけでは見えない、好きなプレイ傾向、普段の活動、コミュニティでの立ち位置、
					目標への考え方などを短い文章で置くためのボックスです。視線を一度ここで止めることで、
					左側の実績列に入る前に個性を差し込めます。
				</div>
			</div>
		</div>
	);
}