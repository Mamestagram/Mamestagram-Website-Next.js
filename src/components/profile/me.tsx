import classNames from "classnames";
import FontAwesome from "@/components/font-awesome";
import BBCodeImageErrorHandler from "@/components/profile/bbcode-image-error-handler";
import { bbCodeParser } from "@/lib/bb-code/bb-tags";
import styles from "@s/profile.module.css";

export default function AboutMe({ bbCode }: { bbCode: string | null }) {
	const html = bbCodeParser.parseToHtml(bbCode ?? "");

	return (
		<div className={classNames(styles.section_box, styles.about_me)}>
			<h1 className={styles.section_title}>
				<FontAwesome prefix="fad" name="id-badge"/>
				About Me
			</h1>
			<div className={styles.userpage_content} dangerouslySetInnerHTML={{ __html: html }}/>
			<BBCodeImageErrorHandler/>
		</div>
	);
}
