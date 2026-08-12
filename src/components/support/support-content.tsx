import Image from "next/image";
import type { SupportData } from "@/app/api/support/route";
import FontAwesome from "@/components/font-awesome";
import PageHero from "@/components/page-hero";
import SupportSidebar from "@/components/support/support-sidebar";
import SupportSectionHeading from "@/components/support/support-section-heading";
import SupportFeatures from "@/components/support/support-features";
import SupportBackToTop from "@/components/support/support-back-to-top";
import { fetchInternalJson } from "@/lib/fetch-json";
import styles from "@s/support.module.css";

export type SupportLocale = "en" | "ja";

export default async function SupportContent({ locale }: Readonly<{ locale: SupportLocale }>) {
	const support = await fetchInternalJson<SupportData>("/api/support");
	const { links, mediaRoot, copy, features } = support;
	const text = copy[locale];

	return (
		<div className={styles.page} lang={locale}>
			<PageHero
				description={text.description}
				imageSrc="https://img.mamesosu.net/2"
				title={text.title}
				variant="support"
			/>

			<div className={styles.shell}>
				<SupportSidebar locale={locale} languageLabel={text.language} nav={text.nav}/>
				<article className={styles.content}>
					<section id="introduction" className={styles.support_section} data-page-enter="section">
						<SupportSectionHeading icon="heart-circle-check" title={text.nav.introduction}/>
						<div className={styles.lead_card} data-page-enter="box">
							<span><FontAwesome prefix="fad" name="heart"/>Mamestagram Supporter</span>
							<h2>{text.introTitle}</h2>
							{text.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
						</div>
						<div className={styles.impact_grid}>
							<div data-page-enter="box"><i><FontAwesome prefix="fad" name="server"/></i><strong>Server</strong><p>{locale === "ja" ? "サーバーの継続的な運営" : "Reliable ongoing operation"}</p></div>
							<div data-page-enter="box"><i><FontAwesome prefix="fad" name="code"/></i><strong>Development</strong><p>{locale === "ja" ? "新しい機能と体験の開発" : "New features and experiences"}</p></div>
							<div data-page-enter="box"><i><FontAwesome prefix="fad" name="people-group"/></i><strong>Community</strong><p>{locale === "ja" ? "コミュニティ活動の支援" : "Support for community activity"}</p></div>
						</div>
					</section>

					<section id="features" className={styles.support_section} data-page-enter="section">
						<SupportSectionHeading icon="sparkles" title={text.perksTitle}/>
						<p className={styles.section_lead}>{text.perksLead}</p>
						<SupportFeatures features={features[locale]} labels={text.labels}/>
					</section>

					<section id="subscription" className={styles.support_section} data-page-enter="section">
						<SupportSectionHeading icon="badge-check" title={text.subscriptionTitle}/>
						<p className={styles.section_lead}>{text.subscriptionLead}</p>
						<div className={styles.subscription_grid}>
							<article data-page-enter="box"><i><FontAwesome prefix="fad" name="tags"/></i><span><strong>{text.price}</strong><p>{text.priceCaption}</p></span></article>
							<article data-page-enter="box"><i><FontAwesome prefix="fad" name="bolt"/></i><span><strong>{text.assignment}</strong><p>{text.assignmentCaption}</p></span></article>
						</div>
						<div className={styles.cancel_note} data-page-enter="box"><FontAwesome prefix="fad" name="calendar-check"/><p>{text.cancelNote}</p></div>
						<div className={styles.cta_card} data-page-enter="box">
							<div><h3>{text.ctaTitle}</h3><p>{text.ctaBody}</p></div>
							<a href={links.koFi} target="_blank" rel="noopener noreferrer">
								<Image src={`${mediaRoot}/ko-fi.png`} alt="Ko-fi" draggable={false} width={980} height={198}/>
								<span>{text.cta}<FontAwesome prefix="fas" name="arrow-up-right"/></span>
							</a>
						</div>
					</section>
					<SupportBackToTop label={text.backToTop}/>
				</article>
			</div>
		</div>
	);
}
