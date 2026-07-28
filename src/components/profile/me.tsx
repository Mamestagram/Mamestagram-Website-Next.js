import classNames from "classnames";
import FontAwesome from "@/components/font-awesome";
import AboutMeEditor from "@/components/profile/about-me-editor";
import AboutMeEmptyState from "@/components/profile/about-me-empty-state";
import BBCodeImageErrorHandler from "@/components/profile/bbcode-image-error-handler";
import { bbCodeParser } from "@/lib/bb-code/bb-tags";
import styles from "@s/profile.module.css";

export default function AboutMe({ bbCode, canEdit = false, mode }: {
	bbCode: string | null,
	canEdit?: boolean,
	mode: string
}) {
	const html = bbCodeParser.parseToHtml(bbCode ?? "");
	const hasContent = html.trim().length > 0;

	return (
		<div className={classNames(styles.section_box, styles.about_me)}>
			{canEdit ? (
				<AboutMeEditor initialBBCode={bbCode ?? ""} initialHtml={html} mode={mode}/>
			) : (
				<>
					<h1 className={styles.section_title}>
						<FontAwesome prefix="fad" name="id-badge"/>
						About Me
					</h1>
					{hasContent ? (
						<>
							<div className={styles.userpage_content} dangerouslySetInnerHTML={{ __html: html }}/>
							<BBCodeImageErrorHandler/>
						</>
					) : <AboutMeEmptyState/>}
				</>
			)}
		</div>
	);
}
