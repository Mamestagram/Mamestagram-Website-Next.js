import Image from "next/image";
import FontAwesome from "@/components/font-awesome";
import ModeIcon from "@/components/mode-icon";
import DocumentsSidebar from "@/components/documents/documents-sidebar";
import ConnectGuide from "@/components/documents/connect-guide";
import FaqList from "@/components/documents/faq-list";
import BackToTop from "@/components/documents/back-to-top";
import SectionHeading from "@/components/documents/section-heading";
import RuleCard from "@/components/documents/rule-card";
import SupportNotice from "@/components/documents/support-notice";
import DanRequirementsTable from "@/components/documents/dan-requirements-table";
import { GET, type DocumentsData, type Locale } from "@/app/api/documents/route";
import styles from "@s/documents.module.css";

export default async function DocumentsContent({ locale }: { locale: Locale }) {
	const documents = await GET().json() as DocumentsData;
	const { links, commandCategories, copy, connectImages, danModes } = documents;
	const text = copy[locale];

	return (
		<div className={styles.page} lang={locale}>
			<section className={styles.hero}>
				<Image className={styles.hero_image}
				       src="/images/banner/documents.jpg"
				       alt=""
				       draggable={false}
				       fill
				       sizes="100vw"
				       priority/>
				<div className={styles.hero_overlay}></div>
				<div className={styles.hero_content}>
					<h1>{text.title}</h1>
					<p>{text.description}</p>
				</div>
			</section>

			<div className={styles.shell}>
				<DocumentsSidebar locale={locale} languageLabel={text.language} nav={text.nav}/>

				<article className={styles.content}>
					<section id="introduction" className={styles.document_section}>
						<SectionHeading icon="sparkles" title={text.nav.introduction}/>
						<div className={styles.lead_card}>
							<h2>{text.introTitle}</h2>
							<p>{text.introLead}</p>
							<p>{text.introBody}</p>
							<p>{text.introDan}</p>
							<div className={styles.ruleset_chips} aria-label="Supported rulesets">
								<span>Vanilla</span><span>Relax</span><span>Autopilot</span><span>Dans</span>
							</div>
						</div>
						<h3 className={styles.subheading}>{text.featuresTitle}</h3>
						<div className={styles.feature_grid}>
							{text.features.map((feature, index) =>
								<a key={feature.title}
								   className={styles.feature_card}
								   href={links.featureLinks[index]}
								   target="_blank"
								   rel="noopener noreferrer">
									<span className={styles.feature_image}>
										<Image src={`/images/documents/about/${feature.image}.png`}
										       alt=""
										       draggable={false}
										       width={1920}
										       height={1080}/>
									</span>
									<span className={styles.feature_copy}>
										<i><FontAwesome prefix="fad" name={feature.icon}/></i>
										<span><small>{feature.channel}</small><strong>{feature.title}</strong></span>
									</span>
									<p>{feature.body}</p>
								</a>)}
						</div>
					</section>

					<section id="rules" className={styles.document_section}>
						<SectionHeading icon="shield-check" title={text.nav.rules}/>
						<p className={`${styles.section_lead} ${styles.rules_lead}`}>{text.rulesLead}</p>
						<div className={styles.rule_grid}>
							<RuleCard icon="messages" title={text.discordRulesTitle} rules={text.discordRules}/>
							<RuleCard icon="gamepad-modern" title={text.serverRulesTitle} rules={text.serverRules}/>
						</div>
						<div className={styles.clan_notice}>
							<FontAwesome prefix="fad" name="people-roof"/>
							<span><strong>{text.clanRulesTitle}</strong><p>{text.clanRulesBody}</p></span>
						</div>
						<SupportNotice icon="ticket" title={text.reportTitle} body={text.reportBody} href={links.ticket}/>
						<SupportNotice icon="envelope-open-text" title={text.appealTitle} body={text.appealBody} href={links.ticket}/>
					</section>

					<section id="connect" className={styles.document_section}>
						<SectionHeading icon="plug-circle-bolt" title={text.nav.connect}/>
						<p className={styles.section_lead}>{text.connectLead}</p>
						<ConnectGuide text={text} images={connectImages[locale]} launchOption={links.launchOption}/>
					</section>

					<section id="commands" className={styles.document_section}>
						<SectionHeading icon="terminal" title={text.nav.commands}/>
						<p className={styles.section_lead}>{text.commandsLead}</p>
						<div className={styles.command_categories}>
							{commandCategories.map((category) =>
								<section key={category.title.en} className={styles.command_category}>
									<h3><i><FontAwesome prefix="fad" name={category.icon}/></i>{category.title[locale]}</h3>
									<div className={styles.command_grid}>
										{category.items.map((item) =>
											<article key={item.command} className={styles.command_item}>
												<code>{item.command}</code>
												<p>{item.description[locale]}</p>
											</article>)}
									</div>
								</section>)}
						</div>
						<a className={styles.command_source} href={links.commandsChannel} target="_blank" rel="noopener noreferrer">
							<FontAwesome prefix="fab" name="discord"/>{text.commandsSource}<FontAwesome prefix="fas" name="arrow-up-right"/>
						</a>
					</section>

					<section id="dans" className={styles.document_section}>
						<SectionHeading icon="medal" title={text.nav.dans}/>
						<p className={styles.section_lead}>{text.dansLead}</p>
						<div className={styles.dan_actions}>
							<a href={links.allDans} target="_blank" rel="noopener noreferrer">
								<FontAwesome prefix="fad" name="file-zipper"/>{text.downloadAll}
							</a>
							<a href={links.danChannel} target="_blank" rel="noopener noreferrer">
								<FontAwesome prefix="fab" name="discord"/>{text.danChannel}
							</a>
						</div>
						<div className={styles.dan_grid}>
							{danModes.map((dan) =>
								<article key={dan.mode} className={styles.dan_card}>
									<div className={styles.dan_card_header}>
										<ModeIcon mode={dan.mode}/>
										<span><h3>{dan.name}</h3></span>
									</div>
									<DanRequirementsTable dan={dan} headers={text.danHeaders}/>
									<a href={dan.download} target="_blank" rel="noopener noreferrer">
										{text.downloadMode}<FontAwesome prefix="fas" name="arrow-down-to-line"/>
									</a>
								</article>)}
						</div>
					</section>

					<section id="faq" className={styles.document_section}>
						<SectionHeading icon="circle-question" title={text.nav.faq}/>
						<p className={styles.section_lead}>{text.faqLead}</p>
						<FaqList faqs={text.faqs}/>
					</section>

					<BackToTop label={text.backToTop}/>
				</article>
			</div>
		</div>
	);
}
