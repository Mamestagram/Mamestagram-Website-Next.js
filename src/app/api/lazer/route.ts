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
	releaseStatus: string,
	packageBody: string,
	comingSoon: string,
	downloadNotice: string,
	windowsTitle: string,
	windowsLead: string,
	windowsSteps: ReadonlyArray<LazerStep>,
	macOSTitle: string,
	macOSLead: string,
	downloadOsu: string,
	macOSSteps: ReadonlyArray<LazerStep>
}>;

const lazerData = {
	showSetupGuides: false,
	version: "v1.0.0",
	links: {
		osuDownload: "https://osu.ppy.sh/home/download"
	},
	copy: {
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
				["file-arrow-down", "Download the Windows package", [{ text: "Once v1.0.0 is released, download patcher from the official release." }]],
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
			macOSLead: "After the patcher is released, macOS will require a freshly downloaded osu! client instead of your existing installation.",
			downloadOsu: "Download osu!",
			macOSSteps: [
				["download", "Download a fresh osu! client", [{ text: "Get a new copy of osu! from the official download page instead of reusing your existing client." }]],
				["file-arrow-down", "Download the patcher", [{ text: "Once v1.0.0 is released, download the macOS patcher files from the official release." }]],
				["terminal", "Run the command file", [
					{ text: "Launch " },
					{ text: "Run this.command", style: "code" },
					{ text: "." }
				]],
				["shield-check", "Allow it when required", [{ text: "If macOS blocks it, allow the app from System Settings and start it again." }]],
				["folder-open", "Select the new client", [
					{ text: "Choose the downloaded " },
					{ text: "osu!.app", style: "code" },
					{ text: " in the Target field." }
				]],
				["play", "Start Mamestagram", [
					{ text: "Select " },
					{ text: "Mamestagram", style: "strong" },
					{ text: ", click " },
					{ text: "PLAY", style: "strong" },
					{ text: ", then sign in and enjoy." }
				]]
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
				["file-arrow-down", "Windows版をダウンロード", [{ text: "v1.0.0の公開後、公式リリースからパッチャーをダウンロードします。" }]],
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
			macOSLead: "パッチャーの公開後、macOSでは既存のクライアントではなく、新しくダウンロードしたosu!クライアントが必要です。",
			downloadOsu: "osu!をダウンロード",
			macOSSteps: [
				["download", "新しいosu!クライアントをダウンロード", [{ text: "公式ダウンロードページから新しいosu!を取得します。既存のクライアントは使用しません。" }]],
				["file-arrow-down", "パッチャーをダウンロード", [{ text: "v1.0.0の公開後、公式リリースからmacOS用のパッチャーファイルをダウンロードします。" }]],
				["terminal", "コマンドファイルを実行", [
					{ text: "" },
					{ text: "Run this.command", style: "code" },
					{ text: "を起動します。" }
				]],
				["shield-check", "必要に応じて実行を許可", [{ text: "macOSにブロックされた場合は、システム設定からアプリの実行を許可して再度起動します。" }]],
				["folder-open", "新しいクライアントを選択", [
					{ text: "Target欄で、ダウンロードした" },
					{ text: "osu!.app", style: "code" },
					{ text: "を選択します。" }
				]],
				["play", "Mamestagramを起動", [
					{ text: "" },
					{ text: "Mamestagram", style: "strong" },
					{ text: "を選択して" },
					{ text: "PLAY", style: "strong" },
					{ text: "をクリックし、ログインしてお楽しみください。" }
				]]
			]
		}
	} satisfies Record<LazerLocale, LazerCopy>
} as const;

export type LazerData = typeof lazerData;

export const GET = (): NextResponse<LazerData> => {
	return NextResponse.json(lazerData);
};
