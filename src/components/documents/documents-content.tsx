"use client";

import Image from "next/image";
import { type CSSProperties, type MouseEvent, useEffect, useRef, useState } from "react";
import FontAwesome from "@/components/font-awesome";
import ModeIcon from "@/components/mode-icon";
import type { DocumentsData, Locale } from "@/app/api/documents/route";
import { OsuMode } from "@/lib/mode";
import styles from "@s/documents.module.css";

type SectionKey = "introduction" | "rules" | "connect" | "commands" | "dans" | "faq";

const sectionIcons: Record<SectionKey, string> = {
	introduction: "sparkles",
	rules: "shield-check",
	connect: "plug-circle-bolt",
	commands: "terminal",
	dans: "medal",
	faq: "circle-question"
};

const sectionKeys: SectionKey[] = ["introduction", "rules", "connect", "commands", "dans", "faq"];

export default function DocumentsContent() {
	const [documents, setDocuments] = useState<DocumentsData | null>(null);
	const [loadError, setLoadError] = useState(false);
	const [requestVersion, setRequestVersion] = useState(0);
	const [locale, setLocale] = useState<Locale>("en");
	const [activeSection, setActiveSection] = useState<SectionKey>("introduction");
	const [copied, setCopied] = useState(false);
	const [floatingBackToTop, setFloatingBackToTop] = useState(false);
	const [footerOverlap, setFooterOverlap] = useState(0);
	const [openFaqItems, setOpenFaqItems] = useState<Set<number>>(() => new Set([0]));
	const copiedTimer = useRef<number | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		fetch("/api/documents", { signal: controller.signal })
			.then((response) => {
				if (!response.ok) throw new Error(`Documents API returned ${response.status}`);
				return response.json() as Promise<DocumentsData>;
			})
			.then(setDocuments)
			.catch((error: unknown) => {
				if (error instanceof DOMException && error.name === "AbortError") return;
				setLoadError(true);
			});

		return () => controller.abort();
	}, [requestVersion]);

	useEffect(() => {
		if (!documents) return;

		let frame = 0;
		const updateScrollState = () => {
			window.cancelAnimationFrame(frame);
			frame = window.requestAnimationFrame(() => {
				const activationLine = Math.min(230, window.innerHeight * .3);
				let current = sectionKeys[0];
				for (const section of sectionKeys) {
					const element = document.getElementById(section);
					if (element && element.getBoundingClientRect().top <= activationLine) current = section;
					else break;
				}
				const documentHeight = document.documentElement.scrollHeight;
				const atBottom = window.scrollY + window.innerHeight >= documentHeight - 24;
				if (atBottom) current = sectionKeys.at(-1)!;
				const footer = document.querySelector("footer");
				const visibleFooterHeight = footer ? Math.max(0, window.innerHeight - footer.getBoundingClientRect().top) : 0;
				const maximumOffset = Math.max(0, window.innerHeight - 74);
				setActiveSection(current);
				setFooterOverlap(Math.min(visibleFooterHeight, maximumOffset));
				setFloatingBackToTop(window.scrollY > 120);
			});
		};

		updateScrollState();
		window.addEventListener("scroll", updateScrollState, { passive: true });
		window.addEventListener("resize", updateScrollState);
		return () => {
			window.cancelAnimationFrame(frame);
			window.removeEventListener("scroll", updateScrollState);
			window.removeEventListener("resize", updateScrollState);
		};
	}, [documents]);

	useEffect(() => () => {
		if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
	}, []);

	if (!documents) {
		return (
			<div className={styles.page}>
				<div className={styles.documents_state} role="status" data-error={loadError}>
					<FontAwesome prefix="fad" name={loadError ? "triangle-exclamation" : "spinner-third"}/>
					<strong>{loadError ? "Documents could not be loaded." : "Loading documents..."}</strong>
					{loadError && <button type="button" onClick={() => {
						setLoadError(false);
						setRequestVersion((version) => version + 1);
					}}>Try again</button>}
				</div>
			</div>
		);
	}

	const { links, commandCategories, copy, connectImages, danModes } = documents;
	const text = copy[locale];

	const copyLaunchOption = async () => {
		await navigator.clipboard.writeText(links.launchOption);
		setCopied(true);
		if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
		copiedTimer.current = window.setTimeout(() => setCopied(false), 1800);
	};

	const scrollToSection = (event: MouseEvent<HTMLAnchorElement>, section: string, hash = `#${section}`) => {
		event.preventDefault();
		const target = document.getElementById(section);
		if (!target) return;

		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
		window.history.pushState(null, "", hash);
	};

	const scrollToTop = (event: MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
		window.history.pushState(null, "", "#");
	};

	const toggleFaq = (index: number) => {
		setOpenFaqItems((current) => {
			const next = new Set(current);
			if (next.has(index)) next.delete(index);
			else next.add(index);
			return next;
		});
	};

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
				<aside className={styles.sidebar}>
					<div className={styles.language_switcher}>
						<span>{text.language}</span>
						<div role="group" aria-label="Document language">
							{(["en", "ja"] as Locale[]).map((language) =>
								<button key={language}
								        type="button"
								        data-active={locale === language}
								        aria-pressed={locale === language}
								        onClick={() => setLocale(language)}>
									{language.toUpperCase()}
								</button>)}
						</div>
					</div>
					<nav className={styles.document_nav} aria-label="Document sections">
						{sectionKeys.map((section, index) =>
							<a key={section}
							   href={`#${section}`}
							   data-active={activeSection === section}
							   aria-current={activeSection === section ? "location" : undefined}
							   onClick={(event) => scrollToSection(event, section)}>
								<span>{String(index + 1).padStart(2, "0")}</span>
								<FontAwesome prefix="fad" name={sectionIcons[section]}/>
								<strong>{text.nav[section]}</strong>
							</a>)}
					</nav>
				</aside>

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
						<div className={styles.notice}>
							<FontAwesome prefix="fad" name="ticket"/>
							<span><strong>{text.reportTitle}</strong><p>{text.reportBody}</p></span>
							<a href={links.ticket} target="_blank" rel="noopener noreferrer">
								# support <FontAwesome prefix="fas" name="arrow-up-right"/>
							</a>
						</div>
						<div className={styles.notice}>
							<FontAwesome prefix="fad" name="envelope-open-text"/>
							<span><strong>{text.appealTitle}</strong><p>{text.appealBody}</p></span>
							<a href={links.ticket} target="_blank" rel="noopener noreferrer">
								# support <FontAwesome prefix="fas" name="arrow-up-right"/>
							</a>
						</div>
					</section>

					<section id="connect" className={styles.document_section}>
						<SectionHeading icon="plug-circle-bolt" title={text.nav.connect}/>
						<p className={styles.section_lead}>{text.connectLead}</p>
						<button type="button" className={styles.command_box} onClick={copyLaunchOption} aria-label={`${text.copy}: ${links.launchOption}`}>
							<span><small>{text.copyCommand}</small><code>{links.launchOption}</code></span>
							<span className={styles.copy_status} data-copied={copied}>
								<FontAwesome prefix="fad" name={copied ? "check" : "copy"}/>{copied ? text.copied : text.copy}
							</span>
						</button>
						<ol className={styles.steps}>
							{text.connectSteps.map((step, index) =>
								<li key={step}>
									<span className={styles.step_number}>{String(index + 1).padStart(2, "0")}</span>
									<div className={styles.step_body}>
										<p>{index === 5
											? <CommandSentence text={step} command={links.launchOption} copied={copied} copyLabel={copied ? text.copied : text.copy} onCopy={copyLaunchOption}/>
											: step}</p>
										{connectImages[locale][index].length > 0 &&
											<div className={styles.step_images} data-count={connectImages[locale][index].length} data-step={index + 1}>
												{connectImages[locale][index].map((image) =>
													<Image key={image.src} {...image} alt="" draggable={false}/>)}
											</div>}
									</div>
								</li>)}
						</ol>
						<div className={styles.success_message}>
							<FontAwesome prefix="fad" name="circle-check"/>
							<strong>{text.connected}</strong>
						</div>
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
									<div className={styles.dan_table_scroll}>
										<table className={styles.dan_table}>
											<thead><tr>{text.danHeaders.map((header, index) =>
												(index !== 1 || dan.mode !== OsuMode.mania) && (index !== 2 || dan.mode === OsuMode.mania) &&
												<th key={header} data-optional={index === 2}>{header}</th>)}</tr></thead>
											<tbody>{dan.requirements.map((requirement) =>
												<tr key={`${requirement.course}-${requirement.level ?? requirement.keys}`}>
													<td>{requirement.course}</td>
													{dan.mode !== OsuMode.mania && <td>{requirement.level}</td>}
													{dan.mode === OsuMode.mania && <td data-optional="true">{requirement.keys ?? "—"}</td>}
													<td>{requirement.accuracy}</td>
													<td>{requirement.score}</td>
													<td>{requirement.mod}</td>
													<td>{requirement.misses}</td>
													<td>{requirement.combo}</td>
												</tr>)}
											</tbody>
										</table>
									</div>
									<a href={dan.download} target="_blank" rel="noopener noreferrer">
										{text.downloadMode}<FontAwesome prefix="fas" name="arrow-down-to-line"/>
									</a>
								</article>)}
						</div>
					</section>

					<section id="faq" className={styles.document_section}>
						<SectionHeading icon="circle-question" title={text.nav.faq}/>
						<p className={styles.section_lead}>{text.faqLead}</p>
						<div className={styles.faq_list}>
							{text.faqs.map(([question, answer], index) => {
								const isOpen = openFaqItems.has(index);
								const answerId = `faq-answer-${index}`;
								return <div key={question} className={styles.faq_item} data-open={isOpen}>
									<button type="button"
									        className={styles.faq_question}
									        aria-expanded={isOpen}
									        aria-controls={answerId}
									        onClick={() => toggleFaq(index)}>
										<span>Q{String(index + 1).padStart(2, "0")}</span>
										{question}
										<FontAwesome prefix="fas" name="plus"/>
									</button>
									<div id={answerId} className={styles.faq_answer} aria-hidden={!isOpen}><div><p>{answer}</p></div></div>
								</div>;
							})}
						</div>
					</section>

					<a className={styles.back_to_top}
					   data-floating={floatingBackToTop}
					   href="#"
					   style={{ "--footer-overlap": `${footerOverlap}px` } as CSSProperties}
					   onClick={scrollToTop}>
						<FontAwesome prefix="fas" name="arrow-up"/>{text.backToTop}
					</a>
				</article>
			</div>
		</div>
	);
}

function SectionHeading({ icon, title }: { icon: string, title: string }) {
	return (
		<div className={styles.section_heading}>
			<i><FontAwesome prefix="fad" name={icon}/></i>
			<h2>{title}</h2>
		</div>
	);
}

function CommandSentence({ text, command, copied, copyLabel, onCopy }: {
	text: string,
	command: string,
	copied: boolean,
	copyLabel: string,
	onCopy: () => Promise<void>
}) {
	const [before, after = ""] = text.split(command);
	return <>{before}<button type="button" className={styles.inline_command} onClick={onCopy} title={copyLabel}>
		<code>{command}</code><FontAwesome prefix="fad" name={copied ? "check" : "copy"}/>
	</button>{after}</>;
}

function RuleCard({ icon, title, rules }: { icon: string, title: string, rules: readonly string[] }) {
	return (
		<article className={styles.rule_card}>
			<div><i><FontAwesome prefix="fad" name={icon}/></i><h3>{title}</h3></div>
			<ol>{rules.map((rule, index) => <li key={rule}><span>{index + 1}</span><p>{rule}</p></li>)}</ol>
		</article>
	);
}
