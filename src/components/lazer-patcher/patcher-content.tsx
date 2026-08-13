import { Fragment } from "react";
import type { LazerData, LazerTextPart } from "@/app/api/lazer/route";
import FontAwesome from "@/components/font-awesome";
import PageHero from "@/components/page-hero";
import PatcherSidebar from "@/components/lazer-patcher/patcher-sidebar";
import PatcherSectionHeading from "@/components/lazer-patcher/patcher-section-heading";
import PatcherBackToTop from "@/components/lazer-patcher/patcher-back-to-top";
import { fetchInternalJson } from "@/lib/fetch-json";
import styles from "@s/patcher.module.css";

export type LazerLocale = import("@/app/api/lazer/route").LazerLocale;

const renderTextParts = (parts: ReadonlyArray<LazerTextPart>) => {
	return parts.map((part, index) => {
		const key = `${index}-${part.text}`;
		if (part.style === "code") return <code key={key}>{part.text}</code>;
		if (part.style === "strong") return <strong key={key}>{part.text}</strong>;
		return <Fragment key={key}>{part.text}</Fragment>;
	});
};

export default async function PatcherContent({ locale }: Readonly<{ locale: LazerLocale }>) {
	const lazer = await fetchInternalJson<LazerData>("/api/lazer");
	const { copy, links, showSetupGuides, version } = lazer;
	const text = copy[locale];

	return (
		<div className={styles.page} lang={locale}>
			<PageHero
				description={text.heroDescription}
				imageSrc="/images/banner/documents.jpg"
				title="Lazer Patcher"
				variant="patcher"
			/>

			<div className={styles.shell}>
				<PatcherSidebar locale={locale}
				                languageLabel={text.language}
				                nav={text.nav}
				                showSetupGuides={showSetupGuides}/>

				<article className={styles.content}>
					<section id="overview" className={styles.patcher_section} data-page-enter="section">
						<PatcherSectionHeading icon="sparkles" title={text.overviewTitle}/>
						<div className={styles.lead_card} data-page-enter="box">
							<span className={styles.lead_badge}>
								<FontAwesome prefix="fad" name="gamepad-modern"/> {text.leadBadge}
							</span>
							<h2>Mamestagram Lazer Patcher</h2>
							<p>{text.leadBody}</p>
						</div>
						<div className={styles.summary_grid}>
							{text.summaries.map(([icon, title, body]) =>
								<article key={icon} className={styles.summary_card} data-page-enter="box">
									<i><FontAwesome prefix="fad" name={icon}/></i>
									<h3>{title}</h3>
									<p>{body}</p>
								</article>)}
						</div>
					</section>

					<section id="platforms" className={styles.patcher_section} data-page-enter="section">
						<PatcherSectionHeading icon="laptop-mobile" title={text.platformsTitle}/>
						<p className={styles.section_lead}>{text.platformsLead}</p>
						<div className={styles.feature_grid}>
							<article className={styles.feature_card} data-page-enter="box">
								<div className={styles.feature_copy}>
									<i><FontAwesome prefix="fab" name="windows"/></i>
									<span><h3>Windows</h3><p>{text.windowsPlatformBody}</p></span>
								</div>
								<ul className={styles.platform_details}>
									<li><FontAwesome prefix="fad" name="circle-check"/>{text.windowsPlatformDetails[0]}</li>
									<li><FontAwesome prefix="fad" name="flask"/>{text.windowsPlatformDetails[1]}</li>
								</ul>
							</article>
							<article className={styles.feature_card} data-page-enter="box">
								<div className={styles.feature_copy}>
									<i><FontAwesome prefix="fab" name="apple"/></i>
									<span><h3>macOS</h3><p>{text.macOSPlatformBody}</p></span>
								</div>
								<ul className={styles.platform_details}>
									<li><FontAwesome prefix="fad" name="download"/>{text.macOSPlatformDetails[0]}</li>
									<li><FontAwesome prefix="fad" name="flask"/>{text.macOSPlatformDetails[1]}</li>
								</ul>
							</article>
						</div>
					</section>

					<section id="download" className={styles.patcher_section} data-page-enter="section">
						<PatcherSectionHeading icon="download" title={text.downloadTitle}/>
						<div className={styles.download_panel} data-page-enter="box">
							<div className={styles.download_icon}><FontAwesome prefix="fad" name="file-zipper"/></div>
							<div className={styles.download_copy}>
								<span>{text.releaseStatus} · {version}</span>
								<h3>Mamestagram Lazer Patcher</h3>
								<p>{text.packageBody}</p>
							</div>
							<span className={styles.download_button} aria-disabled="true">
								<FontAwesome prefix="fas" name="clock"/>{text.comingSoon}
							</span>
						</div>
						<div className={styles.download_footer}>
							<p><FontAwesome prefix="fad" name="clock"/>{text.downloadNotice}</p>
						</div>
					</section>

					<section id="windows"
					         className={styles.patcher_section}
					         data-page-enter="section"
					         hidden={!showSetupGuides}>
						<PatcherSectionHeading icon="windows" title={text.windowsTitle} prefix="fab"/>
						<p className={styles.section_lead}>{text.windowsLead}</p>
						<div className={styles.guide_actions}>
							<span aria-disabled="true"><FontAwesome prefix="fas" name="clock"/>{text.comingSoon}</span>
						</div>
						<ol className={styles.steps}>
							{text.windowsSteps.map(([icon, title, body], index) =>
								<li key={title} data-page-enter="box">
									<span className={styles.step_number}>{String(index + 1).padStart(2, "0")}</span>
									<i><FontAwesome prefix="fad" name={icon}/></i>
									<div><h3>{title}</h3><p>{renderTextParts(body)}</p></div>
								</li>)}
						</ol>
					</section>

					<section id="macos"
					         className={styles.patcher_section}
					         data-page-enter="section"
					         hidden={!showSetupGuides}>
						<PatcherSectionHeading icon="apple" title={text.macOSTitle} prefix="fab"/>
						<p className={styles.section_lead}>{text.macOSLead}</p>
						<div className={styles.guide_actions}>
							<a href={links.osuDownload} target="_blank" rel="noopener noreferrer">
								<FontAwesome prefix="fas" name="download"/>{text.downloadOsu}
							</a>
							<span aria-disabled="true"><FontAwesome prefix="fas" name="clock"/>{text.comingSoon}</span>
						</div>
						<ol className={styles.steps}>
							{text.macOSSteps.map(([icon, title, body], index) =>
								<li key={title} data-page-enter="box">
									<span className={styles.step_number}>{String(index + 1).padStart(2, "0")}</span>
									<i><FontAwesome prefix="fad" name={icon}/></i>
									<div><h3>{title}</h3><p>{renderTextParts(body)}</p></div>
								</li>)}
						</ol>
					</section>

					<PatcherBackToTop/>
				</article>
			</div>
		</div>
	);
}
