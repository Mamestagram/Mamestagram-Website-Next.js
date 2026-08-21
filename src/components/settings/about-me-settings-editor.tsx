import AboutMeEditor from "@/components/profile/about-me-editor";
import profileStyles from "@s/profile.module.css";
import styles from "@s/settings.module.css";

export default function AboutMeSettingsEditor({ initialBBCode, profileId, isClan }: Readonly<{
	initialBBCode: string,
	profileId: number,
	isClan: boolean
}>) {
	const settingsEndpoint = `/api/settings/me${isClan ? "?scope=clan" : ""}`;

	return (
		<div className={`${profileStyles.container} ${styles.me_editor_scope}`}>
			<div className={`${profileStyles.section_box} ${profileStyles.about_me} ${styles.me_editor_shell}`}>
				<AboutMeEditor key={`${isClan ? "clan" : "profile"}-${profileId}`}
				               initialBBCode={initialBBCode}
				               initialHtml=""
				               profileId={profileId}
				               isClan={isClan}
				               mode="std"
				               alwaysEditing
				               settingsEndpoint={settingsEndpoint}/>
			</div>
		</div>
	);
}
