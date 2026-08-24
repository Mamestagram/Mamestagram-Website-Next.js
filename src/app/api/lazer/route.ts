import { NextResponse } from "next/server";

export type LazerLocale = "en" | "ja";
export type LazerTextPart = Readonly<{
	text: string,
	style?: "code" | "strong"
}>;

type LazerStep = readonly [icon: string, title: string, body: ReadonlyArray<LazerTextPart>];
type LazerCopy = Readonly<{
	language: string,
	heroDescription: string,
	nav: Readonly<Record<"overview" | "platforms" | "download" | "windows" | "macos", string>>,
	overviewTitle: string,
	leadBadge: string,
	leadBody: string,
	summaries: ReadonlyArray<readonly [icon: string, title: string, body: string]>,
	platformsTitle: string,
	platformsLead: string,
	windowsPlatformBody: string,
	windowsPlatformDetails: readonly [string, string],
	macOSPlatformBody: string,
	macOSPlatformDetails: readonly [string, string],
	downloadTitle: string,
	viewRelease: string,
	downloadWindows: string,
	downloadMacOS: string,
	downloadNotice: string,
	windowsTitle: string,
	windowsLead: string,
	windowsSteps: ReadonlyArray<LazerStep>,
	macOSTitle: string,
	macOSLead: string,
	downloadOsu: string,
	macOSSteps: ReadonlyArray<LazerStep>,
	macOSSecurityImageAlts: readonly [string, string],
	macOSTargetImageAlts: readonly [string, string]
}>;

const lazerData = {
	showSetupGuides: true,
	version: "1.0.0",
	links: {
		releases: "https://github.com/Mamestagram/Mamestagram-Lazer-Patcher/releases",
		windowsDownload: "https://github.com/Mamestagram/Mamestagram-Lazer-Patcher/releases/download/v.1.0.0/windows.exe",
		macOSDownload: "https://github.com/Mamestagram/Mamestagram-Lazer-Patcher/releases/download/v.1.0.0/macos.zip",
		osuDownload: "https://osu.ppy.sh/home/download"
	},
	copy: {
		en: {
			language: "Language",
			heroDescription: "Connect osu!lazer to Mamestagram on Windows and macOS with the official Lazer Patcher.",
			nav: {
				overview: "Overview",
				platforms: "Platforms",
				download: "Release",
				windows: "Windows",
				macos: "macOS"
			},
			overviewTitle: "Overview",
			leadBadge: "osu!lazer patcher",
			leadBody: "The official patcher connects osu!lazer to Mamestagram on macOS and Windows while keeping your environment and settings.",
			summaries: [
				["display", "Windows & macOS", "Version 1.0.0 is available for both desktop platforms."],
				["sliders", "Keep your setup", "The patcher is designed to preserve your osu!lazer environment and settings."],
				["server", "Mamestagram access", "Select Mamestagram in the patcher, launch, and sign in with your account."]
			],
			platformsTitle: "Supported Platforms",
			platformsLead: "Version 1.0.0 supports Windows and macOS, with a different setup flow for each platform.",
			windowsPlatformBody: "The Windows version uses your existing osu!lazer installation and settings.",
			windowsPlatformDetails: ["Existing installation supported", "Tested on Windows 11"],
			macOSPlatformBody: "The macOS version requires a separate, freshly downloaded osu! client.",
			macOSPlatformDetails: ["Fresh client required", "Tested on Apple M4 Mac"],
			downloadTitle: "Release",
			viewRelease: "View release",
			downloadWindows: "Download windows.exe",
			downloadMacOS: "Download macos.zip",
			downloadNotice: "Use only the packages published on the official Mamestagram GitHub repository.",
			windowsTitle: "Windows Setup",
			windowsLead: "Use the osu!lazer installation already configured on your Windows PC.",
			windowsSteps: [
				["file-arrow-down", "Download the Windows package", [{ text: "Download windows.exe from the official v1.0.0 release." }]],
				["folder-open", "Select your osu!lazer target", [
					{ text: "In the Target field, choose the " },
					{ text: "current", style: "code" },
					{ text: " folder in your existing osu!lazer installation." }
				]],
				["play", "Start Mamestagram", [
					{ text: "Select " },
					{ text: "Mamestagram", style: "strong" },
					{ text: ", then click " },
					{ text: "PLAY", style: "strong" },
					{ text: "." }
				]],
				["right-to-bracket", "Log in and play", [{ text: "Sign in with your Mamestagram account and enjoy osu!lazer." }]]
			],
			macOSTitle: "macOS Setup",
			macOSLead: "On macOS, use a freshly downloaded osu! client instead of your existing installation.",
			downloadOsu: "Download osu!",
			macOSSteps: [
				["download", "Download a fresh osu! client", [{ text: "Get a new copy of osu! from the official download page instead of reusing your existing client." }]],
				["file-arrow-down", "Download the patcher", [{ text: "Download macos.zip from the official v1.0.0 release, then extract the archive." }]],
				["play", "Run Mamestagram Lazer", [
					{ text: "Launch " },
					{ text: "Mamestagram Lazer", style: "code" },
					{ text: "." }
				]],
				["shield-check", "Allow it when required", [{ text: "If macOS blocks the app, open Privacy & Security in System Settings, select Open Anyway, then confirm Open Anyway in the dialog." }]],
				["folder-open", "Select osu!.app", [
					{ text: "Click " },
					{ text: "change", style: "code" },
					{ text: " beside " },
					{ text: "target", style: "code" },
					{ text: ", select the freshly downloaded " },
					{ text: "osu!.app", style: "code" },
					{ text: ", then click " },
					{ text: "Choose", style: "strong" },
					{ text: "." }
				]],
				["play", "Start Mamestagram", [
					{ text: "Select " },
					{ text: "Mamestagram", style: "strong" },
					{ text: ", click " },
					{ text: "PLAY", style: "strong" },
					{ text: "." }
				]],
				["right-to-bracket", "Log in", [{ text: "Sign in with your Mamestagram account." }]],
				["gamepad-modern", "Enjoy osu!lazer", [{ text: "You can now play osu!lazer on Mamestagram." }]]
			],
			macOSSecurityImageAlts: [
				"Privacy & Security settings showing the Open Anyway button for Mamestagram Lazer",
				"macOS confirmation dialog showing the Open Anyway button for Mamestagram Lazer"
			],
			macOSTargetImageAlts: [
				"Mamestagram Lazer showing the change button beside the target setting",
				"macOS file picker selecting the freshly downloaded osu!.app"
			]
		},
		ja: {
			language: "言語",
			heroDescription: "公式Lazer Patcherを使って、WindowsとmacOSのosu!lazerからMamestagramへ接続できます。",
			nav: {
				overview: "概要",
				platforms: "対応環境",
				download: "リリース",
				windows: "Windows",
				macos: "macOS"
			},
			overviewTitle: "概要",
			leadBadge: "osu!lazerパッチャー",
			leadBody: "osu!lazer環境や設定を維持したままMamestagramへ接続できる公式パッチャーを、macOS版とWindows版で公開しています。",
			summaries: [
				["display", "WindowsとmacOS", "両方のデスクトップ環境に対応したバージョン1.0.0を公開しています。"],
				["sliders", "設定を引き継ぐ", "osu!lazer環境と設定を維持できる仕様です。"],
				["server", "Mamestagramへ接続", "パッチャーでMamestagramを選択し、アカウントへログインできます。"]
			],
			platformsTitle: "対応環境",
			platformsLead: "バージョン1.0.0はWindowsとmacOSに対応し、OSごとに導入方法が異なります。",
			windowsPlatformBody: "Windows版では既存のosu!lazerとその設定を利用できます。",
			windowsPlatformDetails: ["既存のインストールに対応", "Windows 11で動作確認済み"],
			macOSPlatformBody: "macOS版では新しくダウンロードした別のosu!クライアントが必要です。",
			macOSPlatformDetails: ["新規クライアントが必要", "Apple M4 Macで動作確認済み"],
			downloadTitle: "リリース",
			viewRelease: "リリースを見る",
			downloadWindows: "windows.exeをダウンロード",
			downloadMacOS: "macos.zipをダウンロード",
			downloadNotice: "Mamestagram公式GitHubリポジトリで公開されているファイルのみを使用してください。",
			windowsTitle: "Windowsでの接続方法",
			windowsLead: "Windows PCに設定済みのosu!lazerをそのまま利用できます。",
			windowsSteps: [
				["file-arrow-down", "Windows版をダウンロード", [{ text: "公式v1.0.0リリースからwindows.exeをダウンロードします。" }]],
				["folder-open", "osu!lazerの対象を選択", [
					{ text: "Target欄で、既存のosu!lazerインストール先にある" },
					{ text: "current", style: "code" },
					{ text: "フォルダーを選択します。" }
				]],
				["play", "Mamestagramを起動", [
					{ text: "" },
					{ text: "Mamestagram", style: "strong" },
					{ text: "を選択し、" },
					{ text: "PLAY", style: "strong" },
					{ text: "をクリックします。" }
				]],
				["right-to-bracket", "ログインしてプレイ", [{ text: "Mamestagramアカウントでログインし、osu!lazerをお楽しみください。" }]]
			],
			macOSTitle: "macOSでの接続方法",
			macOSLead: "macOSでは既存のクライアントではなく、新しくダウンロードしたosu!クライアントを使用します。",
			downloadOsu: "osu!をダウンロード",
			macOSSteps: [
				["download", "新しいosu!クライアントをダウンロード", [{ text: "公式ダウンロードページから新しいosu!を取得します。既存のクライアントは使用しません。" }]],
				["file-arrow-down", "パッチャーをダウンロード", [{ text: "公式v1.0.0リリースからmacos.zipをダウンロードし、展開します。" }]],
				["play", "Mamestagram Lazerを実行", [
					{ text: "" },
					{ text: "Mamestagram Lazer", style: "code" },
					{ text: "を起動します。" }
				]],
				["shield-check", "必要に応じて実行を許可", [{ text: "macOSにブロックされた場合は、システム設定の「プライバシーとセキュリティ」で「このまま開く」を選択し、確認画面でも「このまま開く」を選択します。" }]],
				["folder-open", "osu!.appを設定", [
					{ text: "" },
					{ text: "target", style: "code" },
					{ text: "の横にある" },
					{ text: "change", style: "code" },
					{ text: "をクリックし、新しくダウンロードした" },
					{ text: "osu!.app", style: "code" },
					{ text: "を選択して" },
					{ text: "選択", style: "strong" },
					{ text: "をクリックします。" }
				]],
				["play", "Mamestagramを起動", [
					{ text: "" },
					{ text: "Mamestagram", style: "strong" },
					{ text: "を選択して" },
					{ text: "PLAY", style: "strong" },
					{ text: "をクリックします。" }
				]],
				["right-to-bracket", "ログイン", [{ text: "Mamestagramアカウントでログインします。" }]],
				["gamepad-modern", "osu!lazerをプレイ", [{ text: "Mamestagramでosu!lazerをお楽しみください。" }]]
			],
			macOSSecurityImageAlts: [
				"Mamestagram Lazerの「このまま開く」ボタンを表示したプライバシーとセキュリティ設定",
				"Mamestagram Lazerの「このまま開く」ボタンを表示したmacOS確認画面"
			],
			macOSTargetImageAlts: [
				"target設定の横にあるchangeボタンを表示したMamestagram Lazer",
				"新しくダウンロードしたosu!.appを選択するmacOSのファイル選択画面"
			]
		}
	} satisfies Record<LazerLocale, LazerCopy>
} as const;

export type LazerData = typeof lazerData;

export const GET = (): NextResponse<LazerData> => {
	return NextResponse.json(lazerData);
};
