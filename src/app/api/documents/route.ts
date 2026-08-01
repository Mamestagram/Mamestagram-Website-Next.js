import { NextResponse } from "next/server";
import { OsuMode, type VnMode } from "@/lib/mode";

export type Locale = "en" | "ja";

const ticket = "https://discord.com/channels/944248031136587796/1171728223407710208";
const danChannel = "https://discord.com/channels/944248031136587796/1175719230650449940";
const allDans = "https://mega.nz/file/QOtzmZBD#5vbWgGLsJ2gMfXPxrjgW_OrljnTdMx3_CZpTOpKS5ww";
const commandsChannel = "https://discord.com/channels/944248031136587796/1087987989600280686";
const featureLinks = [
	"https://discord.com/channels/944248031136587796/1081737936401350717",
	"https://discord.com/channels/944248031136587796/1093845482247307276",
	"https://discord.com/channels/944248031136587796/1012666685989339156"
] as const;
const launchOption = "-devserver mamesosu.net";

const commandCategories = [
	{
		icon: "link",
		title: { en: "Account Linking", ja: "アカウント連携" },
		items: [
			{
				command: "!link <bancho/twitch> <bancho_name/twitch_id>",
				description: {
					en: "Link your Bancho or Twitch account. This enables Bancho-name login and Twitch beatmap requests.",
					ja: "Bancho/Twitchのアカウントを連携させ、Banchoのユーザー名でのログインや、Twitchからのビートマップリクエスト機能を利用できるようにします。"
				}
			}
		]
	},
	{
		icon: "globe",
		title: { en: "Country / Language", ja: "国/言語" },
		items: [{
			command: "!changecountry <code>",
			description: { en: "Change the country and corresponding language assigned to your account.", ja: "アカウントの国と、それに対応する言語を変更します。" }
		}]
	},
	{
		icon: "ranking-star",
		title: { en: "Ranking", ja: "段位" },
		items: [
			{ command: "!ranking <global/country>", description: { en: "Switch between global and country rankings.", ja: "表示される順位の種類を、世界ランキングと国別ランキングで切り替えます。" } },
			{ command: "!setdan <edit/list> <ID1, ID2>", description: { en: "Change the rank title shown on the leaderboard.", ja: "リーダーボードに表示する段位の称号を変更できます。" } },
			{ command: "!nopp <on/off>", description: { en: "Toggle a mode that grants no PP. Available only for vn!taiko, vn!ctb, and vn!mania.", ja: "PPを一切付与しないモードへ変更します。vn!taiko・vn!ctb・vn!maniaのみ利用可能です。" } }
		]
	},
	{
		icon: "slot-machine",
		title: { en: "Gacha", ja: "ガチャ" },
		items: [
			{ command: "!gacha play <amount>", description: { en: "Roll the gacha the specified number of times.", ja: "指定された回数分ガチャを回します。" } },
			{ command: "!gacha info", description: { en: "Display the number of badges you own.", ja: "現在所持しているバッジ数を表示します。" } },
			{ command: "!gacha point", description: { en: "Display your current point balance.", ja: "現在所持しているポイント数を表示します。" } }
		]
	},
	{
		icon: "gamepad-modern",
		title: { en: "Gamemode", ja: "ゲームモード" },
		items: [{
			command: "!gamemode <pp/score>",
			description: { en: "Choose whether to play based on score or PP. Supporters only.", ja: "スコア基準でプレイするか、pp基準でプレイするかを選択できます。Supporterのみ利用可能です。" }
		}]
	},
	{
		icon: "bolt",
		title: { en: "Leaderboard", ja: "リーダーボード" },
		items: [
			{ command: "!leaderboard dan <on/off>", description: { en: "Toggle rank-title display on the leaderboard.", ja: "リーダーボードに段位の称号を表示するか設定します。" } },
			{ command: "!leaderboard sort <score/pp/default>", description: { en: "Change the leaderboard sorting order.", ja: "リーダーボードの並び順を変更します。" } },
			{ command: "!leaderboard bancho <on/off>", description: { en: "Switch to Bancho leaderboard and ranking display.", ja: "Banchoのリーダーボード・ランキング表示へ切り替えます。" } },
			{ command: "!leaderboard friend <bancho/clan/fail/friend>", description: { en: "Change the ranking shown in the friend leaderboard. Supporters only.", ja: "フレンドリーダーボードに表示するリーダーボードの種類を変更します。Supporterのみ利用可能です。" } },
			{ command: "!leaderboard size <100-500>", description: { en: "Change how many players appear on the leaderboard. Supporters only.", ja: "リーダーボードに表示するプレイヤー数を変更します。Supporterのみ利用可能です。" } }
		]
	},
	{
		icon: "rabbit-running",
		title: { en: "Speedrun", ja: "スピードラン" },
		items: [
			{ command: "!speedrun pp <value>", description: { en: "Measure the time required to reach the specified PP. Account data is temporarily reset.", ja: "指定されたppを達成するまでの時間を計測します。アカウントのデータは一時的に0へリセットされます。" } },
			{ command: "!speedrun reset", description: { en: "Reset your current speedrun progress.", ja: "進捗をリセットします。" } },
			{ command: "!speedrun end", description: { en: "End the current speedrun measurement.", ja: "計測を終了します。" } }
		]
	},
	{
		icon: "chart-simple",
		title: { en: "Score Submission", ja: "スコア送信" },
		items: [
			{ command: "!submit <on/off>", description: { en: "Completely enable or disable score submission to the server.", ja: "サーバーへのスコア送信を完全に無効化します。" } },
			{ command: "!wipe <top/all>", description: { en: "Delete your scores from the leaderboard. Supporters only.", ja: "リーダーボード上のあなたのスコアを削除します。Supporterのみ利用可能です。" } }
		]
	},
	{
		icon: "people-group",
		title: { en: "Rival", ja: "ライバル" },
		items: [
			{ command: "!rival <add/remove> <userid or player name>", description: { en: "Add or remove a rival. You are notified when a rival surpasses your score.", ja: "ライバルを追加・削除します。ライバルにスコアを抜かされると通知が送信されます。" } },
			{ command: "!rival <msg> <message>", description: { en: "Change the message shown to your rival.", ja: "ライバルへのメッセージを変更します。" } }
		]
	},
	{
		icon: "bell",
		title: { en: "Notifications", ja: "通知" },
		items: [
			{ command: "!notice <score/gacha/welcome> <on/off>", description: { en: "Toggle score, gacha, or login notifications.", ja: "スコア通知、ガチャ通知、ログイン通知のオン・オフを切り替えます。" } },
			{ command: "!snipe <on/off>", description: { en: "Toggle notifications when another player surpasses your #1 score.", ja: "誰かに1位を抜かされたときに送信される通知のオン・オフを切り替えます。" } }
		]
	},
	{
		icon: "music-note",
		title: { en: "Beatmap", ja: "ビートマップ" },
		items: [
			{ command: "!upload <rank/unrank/update>", description: { en: "Change a beatmap not uploaded to Bancho to Loved status.", ja: "Banchoに投稿されていない譜面をLovedステータスに変更します。" } },
			{ command: "!update", description: { en: "Repair the status of a beatmap unavailable on the leaderboard due to infinite loading or similar issues.", ja: "無限ロードなど、リーダーボードを利用できない譜面のステータスを修正します。" } }
		]
	},
	{
		icon: "calculator",
		title: { en: "PP Calculation", ja: "PP計算" },
		items: [{
			command: "!with +<mod (optional)> <acc (optional)>",
			description: { en: "Calculate PP using the specified mods and accuracy.", ja: "指定された条件でppを計算します。" }
		}]
	},
	{
		icon: "people-roof",
		title: { en: "Clan", ja: "クラン" },
		items: [
			{ command: "!clan help", description: { en: "Display clan-command help.", ja: "クランのヘルプを表示します。" } },
			{ command: "!clan create <tag> <name>", description: { en: "Create a new clan.", ja: "新しいクランを作成します。" } },
			{ command: "!clan edit <tag / name>", description: { en: "Change your clan tag or name.", ja: "タグやクランの名前を変更します。" } },
			{ command: "!clan disband", description: { en: "Disband your clan.", ja: "クランを解散します。" } },
			{ command: "!clan info", description: { en: "Display clan information.", ja: "クランの情報を表示します。" } },
			{ command: "!clan leave", description: { en: "Leave your current clan.", ja: "クランを離脱します。" } },
			{ command: "!clan public <on/off>", description: { en: "Change clan visibility. A private clan does not appear on the leaderboard.", ja: "クランの公開設定を変更します。オフにするとリーダーボードにも表示されません。" } },
			{ command: "!clan pending", description: { en: "List players requesting to join your private clan.", ja: "あなたの非公開クランへの参加を希望しているプレイヤー一覧を表示します。" } },
			{ command: "!clan accept <user ID>", description: { en: "Accept a player into your private clan.", ja: "プレイヤーの非公開クランへの参加を許可します。" } },
			{ command: "!clan kick <user ID>", description: { en: "Remove the specified player from your clan.", ja: "特定のユーザーIDのプレイヤーをクランからキックします。" } },
			{ command: "!clan transfer <user ID>", description: { en: "Transfer clan ownership to the specified player.", ja: "特定のユーザーIDのプレイヤーにクランのオーナー権限を譲渡します。" } }
		]
	},
	{
		icon: "heart",
		title: { en: "Multiplayer — original commands", ja: "マルチプレイ（オリジナルコマンドのみ）" },
		items: [
			{ command: "!mp random <on/off>", description: { en: "Randomly choose a host when a match ends.", ja: "マッチ終了時にランダムでホストを選択します。" } },
			{ command: "!mp rotation <on/off>", description: { en: "Automatically rotate the host from top to bottom when a match ends.", ja: "マッチ終了時に上から下へ自動でホストをローテーションします。" } },
			{ command: "!mp invite <message>", description: { en: "Send a multiplayer invitation notification to Discord.", ja: "Discordへマルチプレイの招待通知を送信します。" } }
		]
	}
] as const;

const copy = {
	en: {
		title: "Documents",
		description: "Rules, connection steps, community features, and Dan course information—all in one place.",
		language: "Language",
		copy: "Copy",
		copied: "Copied",
		nav: {
			introduction: "Introduction",
			rules: "Rules",
			connect: "How to connect",
			commands: "In-game commands",
			dans: "Dan Courses",
			faq: "FAQ"
		},
		introTitle: "Overview",
		introLead: "Mamestagram ranks scores that official servers do not, including Relax and Autopilot, while keeping independent leaderboards for every supported mode.",
		introBody: "Earn score and performance points, compete for server #1, discover ranked community maps, and meet players through the Mamestagram community.",
		introDan: "You can also challenge mode-specific Dan Courses and raise your player level by clearing them.",
		featuresTitle: "Community highlights",
		features: [
			{
				icon: "trophy",
				title: "Live score feed",
				channel: "# server",
				body: "New passes and first-place scores are automatically shared with the community.",
				image: 1
			},
			{
				icon: "music-note",
				title: "Map requests",
				channel: "# nominate",
				body: "Request maps to be ranked or deranked. Approved submissions are announced after tester review.",
				image: 2
			},
			{
				icon: "messages",
				title: "Player community",
				channel: "# general-chat / # osu-chat",
				body: "Talk about osu!, share scores, or simply spend time with other players.",
				image: 3
			}
		],
		rulesLead: "Thank you for joining Mamestagram. The following rules must be strictly followed. There are rules for both the private server and Discord, so read and understand them before participating. Accounts may be suspended without warning when rules are not followed.",
		discordRulesTitle: "Prohibited acts on Discord",
		serverRulesTitle: "Prohibited acts on the server",
		discordRules: [
			"Acts that cause inconvenience to members, such as spam or posting phishing URLs.",
			"Sending messages that put a load on members' devices.",
			"Discriminatory language, hatred, or discrimination based on race, gender, religion, creed, social status, or sexual orientation.",
			"Making excessively abusive remarks.",
			"Malicious impersonation of other users.",
			"Distributing cheats, viruses, or self-made software.",
			"Posting or attaching NSFW content.",
			"Any act deemed inappropriate by the administration or a large number of users."
		],
		serverRules: [
			"Creating alternate accounts. Creating one results in an automatic restriction.",
			"Using any cheat to play.",
			"Using tablet filter functions that may trigger cheat-detection systems.",
			"Using inappropriate avatars, banners, self-introductions, or usernames.",
			"Discriminatory language, hatred, or discrimination based on race, gender, religion, creed, social status, or sexual orientation.",
			"Malicious impersonation of other users.",
			"Performing unnecessary computations on the server.",
			"Any act deemed inappropriate by the administration or a large number of users."
		],
		clanRulesTitle: "About the clan feature",
		clanRulesBody: "The server administration is not responsible for issues involving player-managed clans. Join or create clans at your own risk.",
		reportTitle: "Reporting misconduct",
		reportBody: "If you witness or discover misconduct, report it through support. False reports may result in account restrictions.",
		appealTitle: "Appeals",
		appealBody: "If you disagree with an administrative response, contact the administration through support.",
		connectLead: "Create a dedicated osu! shortcut and add Mamestagram's devserver option. You can keep your normal Bancho shortcut alongside it.",
		connectSteps: [
			"Open the folder containing osu!.",
			"Right-click osu!.exe and choose Create shortcut.",
			"Move the shortcut somewhere convenient, such as your desktop.",
			"Rename the shortcut if you want to distinguish it from Bancho.",
			"Right-click the shortcut and open Properties.",
			"In Target, add a space followed by -devserver mamesosu.net after osu!.exe.",
			"Select Apply, then OK. Launch the new shortcut to connect."
		],
		copyCommand: "Launch option",
		connected: "You're ready. Launch the shortcut and sign in with your Mamestagram account.",
		commandsLead: "Send these commands to the server bot from osu! chat. Arguments in <angle brackets> are required; [square brackets] are optional.",
		commandsSource: "Open the current command channel",
		dansLead: "Dan Courses are structured challenges with mode-specific clear requirements. Passing a course raises your player level by the level of that challenge.",
		downloadAll: "Download all Dan maps",
		danChannel: "Open # dan",
		courses: "Featured courses",
		downloadMode: "Download maps",
		danHeaders: ["Course", "Level", "Keys", "Accuracy", "Score", "Mod", "Misses", "Combo"],
		faqLead: "Quick answers to the questions players ask most often.",
		faqs: [
			["What is Mamestagram?", "Mamestagram is a Japanese osu! private server for every game mode. It offers a unique way to play with friends that is not available on official osu!."],
			["What is Mamestagram 4K?", "Mamestagram 4K is an osu!mania 4K-exclusive private server. It uses an Etterna-like rating system, ranks every beatmap, and fully analyzes maps independently of existing osu! difficulties."],
			["What is a private server?", "A private server is an unofficial osu! server with its own systems and rules. Mamestagram includes additional commands, Dan courses, and game modes that provide a different environment from Bancho."],
			["How do I connect to Mamestagram?", "Connect to mamesosu.net. The detailed shortcut setup is available in How to connect above, and the server is designed to be approachable for first-time private-server players."],
			["How do I connect to Mamestagram 4K?", "Connect to mames1.jp. The server is still in development and does not yet have complete documentation; contact support if you need help."],
			["How do I challenge the Dan courses?", "Download the Dan beatmaps from the Dan Courses section or the Dan certification channel, then clear a course under its listed requirements."],
			["Can I use my Bancho account on Mamestagram?", "No. Mamestagram and Bancho accounts are completely separate. Creating a private-server account does not count as multi-accounting; create a new account on the official Mamestagram website."],
			["Where can I find the server commands?", "All commands are listed in the In-game commands section above and the Discord command channel. Send commands to Momiji to customize your server experience."],
			["My player level is not increasing. What should I do?", "Mamestagram player level is determined by Dan level. For example, clearing a 1st Dan increases your level for that mode by one."],
			["My account was restricted, but I do not know why.", "Open a support ticket and ask the administration for assistance."],
			["osu! says my version is too old, but I cannot update it.", "osu! cannot update while connected to Mamestagram or another private server. Connect to Bancho, complete the update, and then sign back into Mamestagram."],
			["How do I report a bug?", "Report it in the Discord bug-report forum."],
			["I want to suggest a new feature.", "Create a post in the Discord idea forum. Suggestions of any size are welcome."]
		],
		backToTop: "Back to top"
	},
	ja: {
		title: "ドキュメント",
		description: "ルール、接続方法、コミュニティ機能、段位情報をまとめて確認できます。",
		language: "言語",
		copy: "コピー",
		copied: "コピー済み",
		nav: {
			introduction: "サーバー紹介",
			rules: "ルール",
			connect: "接続方法",
			commands: "ゲーム内コマンド",
			dans: "段位",
			faq: "よくある質問"
		},
		introTitle: "概要",
		introLead: "MamestagramではRelaxやAutopilotなど、公式サーバーではランク付けされないスコアも対応モードごとに集計します。",
		introBody: "スコアやppを獲得してサーバー1位を目指したり、コミュニティでRankedになったマップや、他のプレイヤーとの交流を楽しめます。",
		introDan: "モードごとの段位に挑戦し、クリアすることでプレイヤーレベルを上げることもできます。",
		featuresTitle: "コミュニティの主な機能",
		features: [
			{
				icon: "trophy",
				title: "スコア速報",
				channel: "# server",
				body: "マップのクリアや1位取得時に、スコアとステータスがコミュニティへ自動投稿されます。",
				image: 1
			},
			{
				icon: "music-note",
				title: "マップリクエスト",
				channel: "# nominate / # maplist",
				body: "マップのRanked・DeRanked申請ができます。テスターによる審査後、承認された内容が通知されます。",
				image: 2
			},
			{
				icon: "messages",
				title: "プレイヤーコミュニティ",
				channel: "# general-chat / # osu-chat",
				body: "osu!の話題やスコア共有はもちろん、ほかのプレイヤーとの雑談も楽しめます。",
				image: 3
			}
		],
		rulesLead: "この度は、Mamestagramへ参加していただきありがとうございます。以下のルールはMamestagramで遊ぶ上で必ず守っていただく必要があります。プライベートサーバーとDiscordサーバーの両方にルールがあるため、よく読んだ上でご参加ください。ルールを守らない場合、運営は警告なしでアカウントを凍結することがあります。サーバーに参加した時点でルールに同意したものとみなします。",
		discordRulesTitle: "Discordサーバーの禁止行為",
		serverRulesTitle: "プライベートサーバーの禁止行為",
		discordRules: [
			"スパムや乗っ取りURLの添付など、メンバーに迷惑をかける行為。",
			"メンバーの端末に負荷をかけるようなメッセージの送信。",
			"他のサーバーを宣伝する行為。",
			"差別用語の使用や、人種、性別、宗教、信条、門地、同性愛への嫌悪・差別に値するあらゆる行為。",
			"節度を超えた暴言を発言する行為。",
			"他ユーザーへの悪質ななりすまし行為。",
			"チート、ウイルス、自作ソフトウェアなどを配布する行為。",
			"NSFWコンテンツの発言・添付行為。",
			"運営または多数のユーザーが不適切だと判断する行為。"
		],
		serverRules: [
			"サブアカウントを作成する行為。作成すると自動で制限されます。",
			"チートエンジンを使用したプレイを送信する行為。",
			"ペンタブレットのフィルター機能を利用する行為。チート検知機能が反応する可能性があります。",
			"不適切なアバター、バナー、自己紹介、ユーザーネームを記載・設定する行為。",
			"差別用語の使用や、人種、性別、宗教、信条、門地、同性愛への嫌悪・差別に値するあらゆる行為。",
			"他ユーザーへの悪質ななりすまし行為。",
			"サーバーに対して不必要な計算を行わせるような行為。",
			"運営または多数のユーザーが不適切だと判断する行為。"
		],
		clanRulesTitle: "クラン機能について",
		clanRulesBody: "当サーバーで作成できる、プレイヤーが運営するクランに関するトラブルについて、運営は一切責任を負いません。自己責任で加入・作成してください。",
		reportTitle: "申告について",
		reportBody: "不正行為を目撃・発見した場合は、supportにて運営へ報告してください。虚偽の申告はアカウントの制限対象になります。",
		appealTitle: "異議申し立てについて",
		appealBody: "運営の対応に異議がある場合は、supportにて運営へ報告してください。",
		connectLead: "Mamestagram専用のosu!ショートカットを作り、devserverオプションを追加します。Bancho用のショートカットはそのまま併用できます。",
		connectSteps: [
			"osu!が保存されているフォルダーを開きます。",
			"osu!.exeを右クリックし、「ショートカットの作成」を選びます。",
			"ショートカットをデスクトップなど、使いやすい場所へ移動します。",
			"Bancho用と区別したい場合はショートカット名を変更します。",
			"ショートカットを右クリックして「プロパティ」を開きます。",
			"「リンク先」のosu!.exeの後に半角スペースと-devserver mamesosu.netを追加します。",
			"「適用」、「OK」の順に選択し、新しいショートカットから起動します。"
		],
		copyCommand: "起動オプション",
		connected: "準備完了です。ショートカットを起動し、Mamestagramアカウントでサインインしてください。",
		commandsLead: "osu!のチャットからサーバーBotへ送信して使います。<山括弧>の引数は必須、[角括弧]は任意です。",
		commandsSource: "最新のコマンドチャンネルを開く",
		dansLead: "段位はモードごとに合格条件が設定されたチャレンジです。クリアすると、挑戦した段位レベルに応じてプレイヤーレベルが上がります。",
		downloadAll: "段位マップをまとめてダウンロード",
		danChannel: "# danを開く",
		courses: "主なコース",
		downloadMode: "マップをダウンロード",
		danHeaders: ["コース", "レベル", "キー", "精度", "スコア", "Mod", "ミス", "コンボ"],
		faqLead: "プレイヤーからよく寄せられる質問をまとめています。",
		faqs: [
			["Mamestagramとは何ですか？", "Mamestagramは全モードを対象とした日本のosu!プライベートサーバーです。通常のosu!では味わえないプレイ体験を、仲間たちと一緒に楽しめます。"],
			["Mamestagram 4Kとは何ですか？", "Mamestagram 4Kはosu!mania 4K専用のプライベートサーバーです。Etternaのようなレートシステムを採用しており、すべての譜面がRankedです。osu!のような既存の難易度には依存せず、譜面を完全に分析するため、実力向上に最適です。"],
			["プライベートサーバーとは何ですか？", "プライベートサーバーとはosu!の非公式サーバーです。接続することで、サーバー独自のシステムを楽しめます。Mamestagramには多くの追加コマンド、段位認定、ゲームモードがあり、Banchoとは異なる環境でosu!をプレイできます。ルールもサーバーごとに異なるため、注意が必要です。"],
			["Mamestagramにはどう接続しますか？", "mamesosu.netに接続します。詳しい情報は、このページの接続方法をご確認ください。初めてのプライベートサーバーでも安心して遊べるのがMamestagramです。"],
			["osu!mania 4K専用サーバー Mamestagram 4Kにはどう接続しますか？", "mames1.jpに接続します。このサーバーはまだ開発段階のため、ドキュメントはありません。分からないことがあればsupportでチケットを作成してください。"],
			["段位認定に挑戦したいのですが、どうすればいいですか？", "段位認定の課題譜面はすべてダウンロードできます。詳しい情報はDan CoursesセクションまたはDiscordの段位認定チャンネルをご確認ください。"],
			["BanchoのアカウントをMamestagramで使用できますか？", "使用できません。MamestagramのアカウントとBanchoのアカウントはまったくの別物です。プライベートサーバーのアカウントを作成してもマルチアカウントにはなりません。アカウントは公式サイトから作成してください。"],
			["サーバーコマンドはどこに書いてありますか？", "コマンドはこのページのゲーム内コマンドセクションとDiscordのコマンドチャンネルにすべて掲載しています。Momijiにコマンドを送信することで、サーバーでのプレイ体験を自分好みにカスタマイズできます。"],
			["プレイヤーレベルが上がりません！どうすればいいですか？", "Mamestagramのプレイヤーレベルは段位のレベルによって決まります。例えば1段をクリアすると、そのモードのレベルも1上がります。"],
			["アカウントが制限されましたが、心当たりがありません。", "supportにてチケットを作成してください。日本語が話せるスタッフもいるため、安心してお問い合わせいただけます。"],
			["osu!のバージョンが古いと言われ、バージョンアップもできません。", "osu!の仕様上、Mamestagramを含むプライベートサーバーからアップデートすることはできません。一度Banchoに接続してアップデートを完了させてから、Mamestagramへログインしてください。"],
			["バグはどのように報告しますか？", "バグを発見した場合は、Discordのbug-reportへ報告してください。日本語でも英語でも構いません。"],
			["新しい機能を提案したいです！", "Discordのideaで投稿を作成してください。気軽に新しい機能をご提案ください。"]
		],
		backToTop: "トップへ戻る"
	}
} as const;

const connectImages: Record<Locale, Array<Array<{ src: string, width: number, height: number }>>> = {
	en: [
		[{ src: "/images/documents/connection/1.png?v=20260801-015734", width: 1194, height: 673 }],
		[
			{ src: "/images/documents/connection/2_en.png", width: 441, height: 790 },
			{ src: "/images/documents/connection/3_en.png", width: 144, height: 167 }
		],
		[{ src: "/images/documents/connection/4_en.png", width: 615, height: 344 }],
		[{ src: "/images/documents/connection/5.png", width: 340, height: 194 }],
		[
			{ src: "/images/documents/connection/6_en.png", width: 442, height: 791 },
			{ src: "/images/documents/connection/7_en.png", width: 423, height: 508 }
		],
		[{ src: "/images/documents/connection/8_en.png", width: 638, height: 545 }],
		[]
	],
	ja: [
		[{ src: "/images/documents/connection/1.png?v=20260801-015734", width: 1194, height: 673 }],
		[
			{ src: "/images/documents/connection/2_ja.png", width: 425, height: 787 },
			{ src: "/images/documents/connection/3_ja.png", width: 159, height: 161 }
		],
		[{ src: "/images/documents/connection/4_ja.png", width: 558, height: 326 }],
		[{ src: "/images/documents/connection/5.png", width: 340, height: 194 }],
		[
			{ src: "/images/documents/connection/6_ja.png", width: 443, height: 787 },
			{ src: "/images/documents/connection/7_ja.png", width: 499, height: 594 }
		],
		[{ src: "/images/documents/connection/8_ja.png", width: 672, height: 622 }],
		[]
	]
};

const danModes: Array<{
	mode: VnMode,
	name: string,
	requirements: Array<{
		course: string,
		level?: string,
		keys?: string,
		accuracy: string,
		score: string,
		mod: string,
		misses: string,
		combo: string
	}>,
	download: string
}> = [
	{
		mode: OsuMode.std,
		name: "osu! standard",
		requirements: [
			{ course: "osu!droid Daninintei Course", level: "1 – 10", accuracy: "95.00%+", score: "0+", mod: "NM", misses: "40-", combo: "0+" },
			{ course: "Standard Dan Certification – Overall", level: "1 – 3", accuracy: "95.00%+", score: "0+", mod: "NM", misses: "40-", combo: "0+" },
			{ course: "Standard Dan Certification – Overall", level: "4 – 5", accuracy: "97.00%+", score: "0+", mod: "NM", misses: "30-", combo: "0+" },
			{ course: "Standard Dan Certification – Overall", level: "6 – 7", accuracy: "97.50%+", score: "0+", mod: "NM", misses: "25-", combo: "800+" },
			{ course: "Standard Dan Certification – Overall", level: "8 – 9", accuracy: "98.00%+", score: "0+", mod: "NM", misses: "15-", combo: "1,000+" },
			{ course: "Standard Dan Certification – Overall", level: "10", accuracy: "98.50%+", score: "0+", mod: "NM", misses: "10-", combo: "1,200+" }
		],
		download: "https://mega.nz/file/QKsHlLhS#xZfttKbJQqt-2mvT0uD9sIKGJH4VQKf41zXIU_JW81U"
	},
	{
		mode: OsuMode.taiko,
		name: "osu! taiko",
		requirements: [
			{ course: "osu!Taiko Dan-I Dojo", level: "1 – 6", accuracy: "0.00%+", score: "650,000+", mod: "Score V2", misses: "—", combo: "0+" },
			{ course: "osu!Taiko Dan-I Dojo", level: "7 – 9", accuracy: "0.00%+", score: "700,000+", mod: "Score V2", misses: "—", combo: "0+" },
			{ course: "osu!Taiko Dan-I Dojo", level: "10 – 12", accuracy: "0.00%+", score: "750,000+", mod: "Score V2", misses: "—", combo: "0+" },
			{ course: "osu!Taiko Dan-I Dojo", level: "13 – 18", accuracy: "0.00%+", score: "800,000+", mod: "Score V2", misses: "—", combo: "0+" },
			{ course: "Rise's Taiko Dans", level: "1 – 5", accuracy: "0.00%+", score: "700,000+", mod: "Score V2", misses: "—", combo: "0+" },
			{ course: "Rise's Taiko Dans", level: "6 – 8", accuracy: "0.00%+", score: "750,000+", mod: "Score V2", misses: "—", combo: "0+" },
			{ course: "Rise's Taiko Dans", level: "9 – 10 / ???", accuracy: "0.00%+", score: "800,000+", mod: "Score V2", misses: "—", combo: "0+" },
			{ course: "Rise's Taiko Dans II", level: "R-4 – R-3", accuracy: "0.00%+", score: "600,000+", mod: "Score V2", misses: "—", combo: "0+" },
			{ course: "Rise's Taiko Dans II", level: "R-2 – R-1", accuracy: "0.00%+", score: "650,000+", mod: "Score V2", misses: "—", combo: "0+" },
			{ course: "Rise's Taiko Dans II", level: "R01 – R04", accuracy: "0.00%+", score: "700,000+", mod: "Score V2", misses: "—", combo: "0+" },
			{ course: "Rise's Taiko Dans II", level: "R05 – R08", accuracy: "0.00%+", score: "750,000+", mod: "Score V2", misses: "—", combo: "0+" },
			{ course: "Rise's Taiko Dans II", level: "R09 – RMG", accuracy: "0.00%+", score: "800,000+", mod: "Score V2", misses: "—", combo: "0+" }
		],
		download: "https://mega.nz/file/lDdgFYwK#_OmVCZfkM3Y_SKBT59W6Mtm3nmxOW8i8a8aySwJbUmU"
	},
	{
		mode: OsuMode.ctb,
		name: "osu! catch",
		requirements: [
			{ course: "Dan ~CTB~", level: "1 – 10", accuracy: "98.00%+", score: "0+", mod: "NM", misses: "—", combo: "0+" },
			{ course: "Dan ~CTB~", level: "11 – 19", accuracy: "99.00%+", score: "0+", mod: "NM", misses: "—", combo: "0+" }
		],
		download: "https://mega.nz/file/BS9CQbzK#pjq5WrFbbpap7G0NA2LYNvNFATyZ1dQDRUseSkTdS-g"
	},
	{
		mode: OsuMode.mania,
		name: "osu! mania",
		requirements: [
			{ course: "Dan ~REFORM~ v2", keys: "4", accuracy: "96.00%+", score: "0+", mod: "NM", misses: "—", combo: "0+" },
			{ course: "4K LN Dan Courses v2", keys: "4", accuracy: "97.00%+", score: "0+", mod: "Score V2", misses: "—", combo: "0+" },
			{ course: "4K shoegazer dan", keys: "4", accuracy: "96.00%+", score: "0+", mod: "NM", misses: "—", combo: "0+" },
			{ course: "TR1PLE DAN", keys: "4", accuracy: "96.00%+", score: "0+", mod: "NM", misses: "—", combo: "0+" },
			{ course: "Chordjack Joker Dan", keys: "4", accuracy: "96.00%+", score: "0+", mod: "NM", misses: "—", combo: "0+" },
			{ course: "6K Regular Dan Course", keys: "6", accuracy: "96.00%+", score: "0+", mod: "NM", misses: "—", combo: "0+" },
			{ course: "6K Regular Advanced Dan Course", keys: "6", accuracy: "96.00%+", score: "0+", mod: "NM", misses: "—", combo: "0+" },
			{ course: "6K LN Dan Course", keys: "6", accuracy: "95.00%+", score: "0+", mod: "NM", misses: "—", combo: "0+" },
			{ course: "Regular Dan Phase", keys: "7", accuracy: "96.00%+", score: "0+", mod: "NM", misses: "—", combo: "0+" },
			{ course: "LN Dan Phase", keys: "7", accuracy: "95.00%+", score: "0+", mod: "NM", misses: "—", combo: "0+" },
			{ course: "Extra Level (Regular)", keys: "7", accuracy: "96.00%+", score: "0+", mod: "NM", misses: "—", combo: "0+" },
			{ course: "Extra Level (LN)", keys: "7", accuracy: "95.00%+", score: "0+", mod: "NM", misses: "—", combo: "0+" },
			{ course: "10K BMS Dans Phase", keys: "10", accuracy: "95.00%+", score: "0+", mod: "NM", misses: "—", combo: "0+" },
			{ course: "Malody 4K Dan Regular", keys: "4", accuracy: "95.00%+", score: "0+", mod: "NM", misses: "—", combo: "0+" },
			{ course: "Malody 4K Dan Extra", keys: "4", accuracy: "96.00%+", score: "0+", mod: "NM", misses: "—", combo: "0+" }
		],
		download: "https://mega.nz/file/BCMihKRK#oifqLN7kbyf1gw_0_QVN7um_-SJKLw-Vb_-r_pRvJ1I"
	}
];

const formatRequirementValue = (value: string): string => {
	return value === "0+" || value === "0.00%+" ? "—" : value;
};

const documentsData = {
	links: {
		ticket,
		danChannel,
		allDans,
		commandsChannel,
		featureLinks,
		launchOption
	},
	commandCategories,
	copy,
	connectImages,
	danModes: danModes.map((dan) => ({
		...dan,
		requirements: dan.requirements.map((requirement) => ({
			...requirement,
			accuracy: formatRequirementValue(requirement.accuracy),
			score: formatRequirementValue(requirement.score),
			combo: dan.mode === OsuMode.std ? requirement.combo : formatRequirementValue(requirement.combo)
		}))
	}))
};

export type DocumentsData = typeof documentsData;

export const GET = (): NextResponse<DocumentsData> => {
	return NextResponse.json(documentsData);
};
