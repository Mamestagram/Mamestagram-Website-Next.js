import FontAwesome from "@/components/font-awesome";
import PageHero from "@/components/page-hero";
import PatcherSidebar from "@/components/lazer-patcher/patcher-sidebar";
import PatcherSectionHeading from "@/components/lazer-patcher/patcher-section-heading";
import PatcherBackToTop from "@/components/lazer-patcher/patcher-back-to-top";
import styles from "@s/patcher.module.css";

export type LazerLocale = "en" | "ja";

const VERSION = "v1.0.0";
const OSU_DOWNLOAD_URL = "https://osu.ppy.sh/home/download";

const copy = {
	en: {
		language: "Language",
		heroDescription: "The Lazer Patcher for connecting to Mamestagram from osu!lazer on Windows and macOS is in preparation and will be released at a later date.",
		nav: {
			overview: "Overview",
			platforms: "Platforms",
			download: "Release",
			windows: "Windows",
			macos: "macOS"
		},
		overviewTitle: "Overview",
		leadBadge: "osu!lazer patcher",
		leadBody: "The upcoming patcher will connect osu!lazer to Mamestagram on macOS and Windows while keeping your current environment and settings.",
		summaries: [
			["display", "Windows & macOS", "Support for both desktop platforms is planned for the upcoming release."],
			["sliders", "Keep your setup", "The patcher is designed to preserve your existing osu!lazer environment and settings."],
			["server", "Mamestagram access", "After release, select Mamestagram in the patcher, launch, and sign in with your account."]
		],
		platformsTitle: "Supported Platforms",
		platformsLead: "The upcoming version 1.0.0 is planned for Windows and macOS, with a different setup flow for each platform.",
		windowsPlatformBody: "The Windows version will use your existing osu!lazer installation and settings.",
		windowsPlatformDetails: ["Existing installation support planned", "Tested on Windows 11"],
		macOSPlatformBody: "The macOS version will require a separate, freshly downloaded osu! client.",
		macOSPlatformDetails: ["Fresh client will be required", "Tested on Apple M4 Mac"],
		downloadTitle: "Release",
		releaseStatus: "In preparation",
		packageBody: "The Windows and macOS packages are being prepared and will be released at a later date.",
		comingSoon: "Coming soon",
		downloadNotice: "Download links will be available here when the release is ready.",
		windowsTitle: "Windows Setup",
		windowsLead: "After the patcher is released, you will be able to use the osu!lazer installation already configured on your Windows PC.",
		windowsSteps: [
			["file-arrow-down", "Download the Windows package", <>Once v1.0.0 is released, download <code>Lazer-Patcher-Windows.zip</code> from the official release.</>],
			["folder-open", "Select your osu!lazer target", <>In the Target field, choose the <code>current</code> folder in your existing osu!lazer installation.</>],
			["play", "Start Mamestagram", <>Select <strong>Mamestagram</strong>, then click <strong>PLAY</strong>.</>],
			["right-to-bracket", "Log in and play", <>Sign in with your Mamestagram account and enjoy osu!lazer.</>]
		],
		macOSTitle: "macOS Setup",
		macOSLead: "After the patcher is released, macOS will require a freshly downloaded osu! client instead of your existing installation.",
		downloadOsu: "Download osu!",
		macOSSteps: [
			["download", "Download a fresh osu! client", <>Get a new copy of osu! from the official download page instead of reusing your existing client.</>],
			["file-arrow-down", "Download the patcher", <>Once v1.0.0 is released, download the macOS patcher files from the official release.</>],
			["terminal", "Run the command file", <>Launch <code>Run this.command</code>.</>],
			["shield-check", "Allow it when required", <>If macOS blocks it, allow the app from System Settings and start it again.</>],
			["folder-open", "Select the new client", <>Choose the downloaded <code>osu!.app</code> in the Target field.</>],
			["play", "Start Mamestagram", <>Select <strong>Mamestagram</strong>, click <strong>PLAY</strong>, then sign in and enjoy.</>]
		]
	},
	ja: {
		language: "言語",
		heroDescription: "WindowsとmacOSのosu!lazerからMamestagramへ接続するLazer Patcherは現在準備中で、後日公開予定です。",
		nav: {
			overview: "概要",
			platforms: "対応環境",
			download: "公開予定",
			windows: "Windows",
			macos: "macOS"
		},
		overviewTitle: "概要",
		leadBadge: "osu!lazerパッチャー",
		leadBody: "現在のosu!lazer環境や設定を維持したままMamestagramへ接続できるパッチャーを、macOS版とWindows版で後日公開予定です。",
		summaries: [
			["display", "WindowsとmacOS", "両方のデスクトップ環境に対応したバージョンを公開予定です。"],
			["sliders", "設定を引き継ぐ", "既存のosu!lazer環境と設定を維持できる仕様で準備しています。"],
			["server", "Mamestagramへ接続", "公開後はパッチャーでMamestagramを選択し、アカウントへログインできます。"]
		],
		platformsTitle: "対応環境",
		platformsLead: "後日公開予定のバージョン1.0.0はWindowsとmacOSに対応し、OSごとに導入方法が異なります。",
		windowsPlatformBody: "Windows版では既存のosu!lazerとその設定を利用できる予定です。",
		windowsPlatformDetails: ["既存のインストールに対応予定", "Windows 11で動作確認済み"],
		macOSPlatformBody: "macOS版では新しくダウンロードした別のosu!クライアントが必要になる予定です。",
		macOSPlatformDetails: ["新規クライアントが必要になる予定", "Apple M4 Macで動作確認済み"],
		downloadTitle: "公開予定",
		releaseStatus: "公開準備中",
		packageBody: "Windows版とmacOS版を準備中です。完成後、後日公開予定です。",
		comingSoon: "後日公開予定",
		downloadNotice: "公開準備が整い次第、このページでダウンロードリンクをご案内します。",
		windowsTitle: "Windowsでの接続方法",
		windowsLead: "パッチャーの公開後、Windows PCに設定済みのosu!lazerをそのまま利用できます。",
		windowsSteps: [
			["file-arrow-down", "Windows版をダウンロード", <>v1.0.0の公開後、公式リリースから<code>Lazer-Patcher-Windows.zip</code>をダウンロードします。</>],
			["folder-open", "osu!lazerの対象を選択", <>Target欄で、既存のosu!lazerインストール先にある<code>current</code>フォルダーを選択します。</>],
			["play", "Mamestagramを起動", <><strong>Mamestagram</strong>を選択し、<strong>PLAY</strong>をクリックします。</>],
			["right-to-bracket", "ログインしてプレイ", <>Mamestagramアカウントでログインし、osu!lazerをお楽しみください。</>]
		],
		macOSTitle: "macOSでの接続方法",
		macOSLead: "パッチャーの公開後、macOSでは既存のクライアントではなく、新しくダウンロードしたosu!クライアントが必要です。",
		downloadOsu: "osu!をダウンロード",
		macOSSteps: [
			["download", "新しいosu!クライアントをダウンロード", <>公式ダウンロードページから新しいosu!を取得します。既存のクライアントは使用しません。</>],
			["file-arrow-down", "パッチャーをダウンロード", <>v1.0.0の公開後、公式リリースからmacOS用のパッチャーファイルをダウンロードします。</>],
			["terminal", "コマンドファイルを実行", <><code>Run this.command</code>を起動します。</>],
			["shield-check", "必要に応じて実行を許可", <>macOSにブロックされた場合は、システム設定からアプリの実行を許可して再度起動します。</>],
			["folder-open", "新しいクライアントを選択", <>Target欄で、ダウンロードした<code>osu!.app</code>を選択します。</>],
			["play", "Mamestagramを起動", <><strong>Mamestagram</strong>を選択して<strong>PLAY</strong>をクリックし、ログインしてお楽しみください。</>]
		]
	}
} as const;

export default function PatcherContent({ locale }: Readonly<{ locale: LazerLocale }>) {
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
				<PatcherSidebar locale={locale} languageLabel={text.language} nav={text.nav}/>

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
								<article key={title} className={styles.summary_card} data-page-enter="box">
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
								<span>{text.releaseStatus} · {VERSION}</span>
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

					<section id="windows" className={styles.patcher_section} data-page-enter="section">
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
									<div><h3>{title}</h3><p>{body}</p></div>
								</li>)}
						</ol>
					</section>

					<section id="macos" className={styles.patcher_section} data-page-enter="section">
						<PatcherSectionHeading icon="apple" title={text.macOSTitle} prefix="fab"/>
						<p className={styles.section_lead}>{text.macOSLead}</p>
						<div className={styles.guide_actions}>
							<a href={OSU_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
								<FontAwesome prefix="fas" name="download"/>{text.downloadOsu}
							</a>
							<span aria-disabled="true"><FontAwesome prefix="fas" name="clock"/>{text.comingSoon}</span>
						</div>
						<ol className={styles.steps}>
							{text.macOSSteps.map(([icon, title, body], index) =>
								<li key={title} data-page-enter="box">
									<span className={styles.step_number}>{String(index + 1).padStart(2, "0")}</span>
									<i><FontAwesome prefix="fad" name={icon}/></i>
									<div><h3>{title}</h3><p>{body}</p></div>
								</li>)}
						</ol>
					</section>

					<PatcherBackToTop/>
				</article>
			</div>
		</div>
	);
}
