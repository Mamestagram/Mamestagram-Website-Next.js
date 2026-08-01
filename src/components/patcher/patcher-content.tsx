import Image from "next/image";
import FontAwesome from "@/components/font-awesome";
import PatcherSidebar from "@/components/patcher/patcher-sidebar";
import PatcherSectionHeading from "@/components/patcher/patcher-section-heading";
import PatcherFaq from "@/components/patcher/patcher-faq";
import PatcherBackToTop from "@/components/patcher/patcher-back-to-top";
import styles from "@s/patcher.module.css";

const VERSION = "v1.0.2";
const DOWNLOAD_URL = "https://github.com/mames1dev/mamesosu-patcher/releases/download/v1.0.2/mamesosu.patcher.exe";
const REPOSITORY_URL = "https://github.com/mames1dev/mamesosu-patcher";

const nav = {
	overview: "Overview",
	features: "Features",
	download: "Download",
	"how-to-use": "How to use",
	faq: "FAQ"
};

const summaries = [
	["file-binary", "Single executable", "Run the patcher, let it launch osu!, and start playing without separate client edits."],
	["gamepad-modern", "Gameplay feedback", "Restore Relax misses and ranking panels so results feel closer to normal gameplay."],
	["bolt", "Fast setup", "No installer flow, file replacement, or manual patching steps before each session."]
] as const;

const features = [
	{
		icon: "crosshairs-simple",
		title: "Enable Relax Misses",
		body: "Miss feedback appears again during Relax play, making reading and failure states easier to understand.",
		image: "https://github.com/user-attachments/assets/a4160a34-10cb-458c-a9a0-fe751b5a751f",
		alt: "Relax misses preview"
	},
	{
		icon: "ranking-star",
		title: "Show Relax Ranking Panels",
		body: "Ranking panels return after a map, keeping the familiar post-play result flow.",
		image: "https://github.com/user-attachments/assets/406864b1-565c-4869-a702-50b48d281f3b",
		alt: "Relax ranking panel preview"
	}
] as const;

const steps = [
	["download", "Download the executable", "Use the official download button above to get mamesosu.patcher.exe."],
	["play", "Run the patcher", "Open the downloaded executable and wait for osu! to launch."],
	["circle-check", "Log in and play", "Log in to Mamestagram and play normally with Relax enabled."]
] as const;

const faqs = [
	["Does this replace osu! files?", "No manual file replacement is required for the intended flow."],
	["Do I need to run it every time?", "Yes. Start your session through the patcher when you want the patched Relax experience."],
	["Can I keep using the normal client too?", "Yes. You can launch your standard client separately whenever you do not need the patcher behavior."]
] as const;

export default function PatcherContent() {
	return (
		<div className={styles.page}>
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
					<h1>Patcher</h1>
					<p>Restore essential gameplay feedback for a more complete Relax experience.</p>
				</div>
			</section>

			<div className={styles.shell}>
				<PatcherSidebar nav={nav} version={VERSION}/>

				<article className={styles.content}>
					<section id="overview" className={styles.patcher_section}>
						<PatcherSectionHeading icon="sparkles" title="Overview"/>
						<div className={styles.lead_card}>
							<span className={styles.lead_badge}><FontAwesome prefix="fab" name="windows"/> Windows utility</span>
							<h2>Mamestagram Patcher</h2>
							<p>A lightweight launcher for Relax play that brings back core gameplay feedback without requiring manual changes to your osu! client.</p>
						</div>
						<div className={styles.summary_grid}>
							{summaries.map(([icon, title, body]) =>
								<article key={title} className={styles.summary_card}>
									<i><FontAwesome prefix="fad" name={icon}/></i>
									<h3>{title}</h3>
									<p>{body}</p>
								</article>)}
						</div>
					</section>

					<section id="features" className={styles.patcher_section}>
						<PatcherSectionHeading icon="wand-magic-sparkles" title="Features"/>
						<p className={styles.section_lead}>Bring familiar visual feedback back into Relax sessions while keeping the normal osu! workflow.</p>
						<div className={styles.feature_grid}>
							{features.map((feature) =>
								<article key={feature.title} className={styles.feature_card}>
									<div className={styles.feature_copy}>
										<i><FontAwesome prefix="fad" name={feature.icon}/></i>
										<span><h3>{feature.title}</h3><p>{feature.body}</p></span>
									</div>
									<div className={styles.feature_image}>
										<Image src={feature.image}
										       alt={feature.alt}
										       draggable={false}
										       width={480}
										       height={310}
										       sizes="(max-width: 700px) 94vw, 540px"/>
									</div>
								</article>)}
						</div>
					</section>

					<section id="download" className={styles.patcher_section}>
						<PatcherSectionHeading icon="download" title="Download"/>
						<div className={styles.download_panel}>
							<div className={styles.download_icon}><FontAwesome prefix="fad" name="file-arrow-down"/></div>
							<div className={styles.download_copy}>
								<span>Latest release · {VERSION}</span>
								<h3>mamesosu.patcher.exe</h3>
								<p>A single Windows executable. No installer or manual client modification is required.</p>
							</div>
							<a className={styles.download_button} href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
								<FontAwesome prefix="fas" name="download"/>Download Patcher
							</a>
						</div>
						<div className={styles.download_footer}>
							<p><FontAwesome prefix="fad" name="shield-check"/>If your browser or security software asks for confirmation, verify the source before continuing.</p>
							<a href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer">
								<FontAwesome prefix="fab" name="github"/>View source<FontAwesome prefix="fas" name="arrow-up-right"/>
							</a>
						</div>
					</section>

					<section id="how-to-use" className={styles.patcher_section}>
						<PatcherSectionHeading icon="list-check" title="How to use"/>
						<ol className={styles.steps}>
							{steps.map(([icon, title, body], index) =>
								<li key={title}>
									<span className={styles.step_number}>{String(index + 1).padStart(2, "0")}</span>
									<i><FontAwesome prefix="fad" name={icon}/></i>
									<div><h3>{title}</h3><p>{body}</p></div>
								</li>)}
						</ol>
					</section>

					<section id="faq" className={styles.patcher_section}>
						<PatcherSectionHeading icon="circle-question" title="FAQ"/>
						<PatcherFaq items={faqs}/>
					</section>

					<PatcherBackToTop/>
				</article>
			</div>
		</div>
	);
}
