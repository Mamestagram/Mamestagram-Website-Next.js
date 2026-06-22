import classNames from "classnames";
import styles from "@s/profile.module.css";

export default function AboutMe({ bbCode }: { bbCode: string | null }) {
	return (
		<div className={classNames(styles.section_box, styles.about_me)}>
			<h1>About Me</h1>
			<div className={styles.userpage_content}>
				{bbCode?.split("\n").map((code, i) => <p key={i}>{code}</p>)}{/* TODO BBCodeParser未完成 */}
			</div>
		</div>
	);
}