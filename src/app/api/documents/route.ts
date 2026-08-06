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
		icon: "terminal",
		title: { en: "Basics and account settings", ja: "基本・アカウント設定" },
		description: {
			en: "General commands for help, language, profile visibility, and server notifications.",
			ja: "ヘルプ、言語、プロフィール公開範囲、サーバー通知に関する基本コマンドです。"
		},
		items: [
			{ command: "!help", description: { en: "Show the commands available to your account. You can also run it as !h or !.", ja: "現在のアカウントで利用できるコマンドを表示します。 !h や ! でも実行できます。" } },
			{ command: "!autotranslate <on/off>", description: { en: "Switch server notices to the language associated with your account country. Enabling it reconnects you to the server automatically.", ja: "サーバー通知をアカウントの国に対応する言語へ切り替えます。onへ変更すると自動的にサーバーへ再接続されます。" } },
			{ command: "!changecountry <code>", description: { en: "Change your account country using a two-letter ISO country code such as jp or us. You can also run it as !cc.", ja: "jpやusなど、2文字のISO国名コードでアカウントの国を変更します。 !cc でも実行できます。" } },
			{ command: "!private", description: { en: "Toggle whether other players can view your profile.", ja: "プロフィールを他のプレイヤーへ公開するかどうかを切り替えます。" } },
			{ command: "!notice <all/score/points/welcome> <on/off>", description: { en: "Enable or disable all notices, score notices, M Point notices, or login welcome notices.", ja: "全通知、スコア関連、M Point関連、ログイン時の通知を種類ごとに切り替えます。" } }
		]
	},
	{
		icon: "ranking-star",
		title: { en: "Scores and rankings", ja: "M Point・スコア・ランキング" },
		description: {
			en: "Control your play style, profile rank, map leaderboards, practice settings, and score notifications.",
			ja: "プレイスタイル、プロフィール順位、マップリーダーボード、練習設定、スコア通知を管理します。"
		},
		items: [
			{ command: "!balance", description: { en: "Show your current M Point balance. You can also run it as !points or !mpoints.", ja: "現在のM Point残高を表示します。 !points や !mpoints でも実行できます。" } },
			{ command: "!gamestyle <pp/score/rate>", description: { en: "Change the play style used for your profile and overall ranking. rate is mainly for 4K mania. You will reconnect to the server automatically after changing it.", ja: "プロフィールと総合ランキングで使用するプレイスタイルを変更します。rateは主に4K mania向けです。変更後は自動的にサーバーへ再接続されます。" } },
			{ command: "!ranking <global/country>", description: { en: "Switch the overall rank shown on your profile between global and country ranking. You will reconnect to the server automatically after changing it.", ja: "プロフィール等に表示する総合順位を世界順位または国別順位へ切り替えます。変更後は自動的にサーバーへ再接続されます。" } },
			{ command: "!forceranked <on/off>", description: { en: "Display every difficulty as Ranked in the client. This does not change score submission or PP eligibility.", ja: "すべてのdifficultyをクライアント上でRanked表示にします。提出可否やPP付与条件は変わりません。" } },
			{ command: "!leaderboard sort <default/pp/score>", description: { en: "Choose map leaderboard sorting. default uses score for Vanilla and PP for Relax or Autopilot; Dan maps always use score.", ja: "マップリーダーボードの並び順を変更します。デフォルトはVanillaがスコア、Relax・AutopilotがPPです。段位はこの設定に関わらず、常にスコア順です。" } },
			{ command: "!leaderboard dan <on/off>", description: { en: "Toggle Dan titles beside player names on map leaderboards.", ja: "リーダーボード上のプレイヤー名に付く段位の称号の表示/非表示を切り替えます。" } },
			{ command: "!leaderboard bancho <on/off>", description: { en: "Include official osu! scores on supported Vanilla leaderboards. You will reconnect to the server automatically after changing it.", ja: "対応するVanillaリーダーボードに公式osu!のスコアを含めます。変更後は自動的にサーバーへ再接続されます。" } },
			{ command: "!leaderboard size <100-500>", description: { en: "Set the number of leaderboard entries from 100 to 500. Supporter only.", ja: "リーダーボードの表示件数を100～500件へ変更します。サポーター専用です。" } },
			{ command: "!leaderboard friend <bancho/clan/friend>", description: { en: "Switch the source shown on the friend leaderboard between official osu! (Bancho), clan, and friend. Supporter only.", ja: "フレンドリーダボードに表示する対象を公式osu!（Bancho）/clan/friendに切り替えます。サポーター専用です。" } },
			{ command: "!nopp <on/off>", description: { en: "Toggle 0 PP practice mode, mainly for Vanilla taiko, catch, and mania.", ja: "主にtaiko・catch・mania（ともにVanilla）向けの0PP練習モードを切り替えます。" } },
			{ command: "!snipe <on/off>", description: { en: "Toggle notices when another player takes one of your #1 scores.", ja: "自分が保持する1位スコアを抜かれたときの通知を切り替えます。" } },
			{ command: "!rival <add/remove/msg> <value>", description: { en: "Add or remove a rival, or change the message shown when scores are sniped.", ja: "ライバルの追加・削除、またはスナイプ時に使用するメッセージを変更します。" } },
			{ command: "!speedrun set <pp>", description: { en: "Set the target PP for a speedrun.", ja: "スピードランで目標にするPPを設定します。" } },
			{ command: "!speedrun start", description: { en: "Start the speedrun. You will reconnect to the server automatically when it starts.", ja: "スピードランを開始します。開始時は自動的にサーバーへ再接続されます。" } },
			{ command: "!speedrun stop", description: { en: "End the speedrun.", ja: "スピードランを終了します。" } }
		]
	},
	{
		icon: "medal",
		title: { en: "Dan title display", ja: "段位の称号表示" },
		description: {
			en: "Choose which completed mania Dan series appears on your profile and leaderboards.",
			ja: "達成済みのmania段位から、プロフィールやリーダーボードへ優先表示する称号を選びます。"
		},
		items: [
			{ command: "!setdan <id> [id] [id]", description: { en: "Select up to three titles from completed mania Dans. IDs: 0: REFORM v2, 1: 4K LN v2, 2: TR1PLE, 3: shoegazer, 4: Chordjack Joker, 5: Malody 4K v3.", ja: "達成済みmania段位の称号を最大3件選択できます。IDは0: REFORM v2、1: 4K LN v2、2: TR1PLE、3: shoegazer、4: Chordjack Joker、5: Malody 4K v3です。" } },
			{ command: "!setdan reset", description: { en: "Reset the displayed mania Dan titles to the default IDs 0 and 1.", ja: "表示するmania段位の称号を既定のID: 0/1へ戻します。" } }
		]
	},
	{
		icon: "link",
		title: { en: "Account linking and utilities", ja: "アカウント連携・ユーティリティ" },
		description: {
			en: "Link external accounts or use lightweight chat utilities.",
			ja: "外部アカウントの連携や、チャット上の簡単なユーティリティを利用します。"
		},
		items: [
			{ command: "!link <twitch/bancho> <account>", description: { en: "Issue a browser URL for linking a Twitch or official osu! account, then complete authentication on that service.", ja: "Twitchまたは公式osu!アカウントを連携するURLを発行します。返されたURLをブラウザーで開いて認証してください。" } },
			{ command: "!roll [max]", description: { en: "Pick a random integer from zero up to, but not including, max. The default range is 0–99, max is 32767, and cooldown is five seconds.", ja: "0以上max未満の整数をランダムに選びます。省略時は0～99、最大値は32767、クールダウンは5秒です。" } }
		]
	},
	{
		icon: "calculator",
		title: { en: "Now Playing and PP calculation", ja: "Now Playing・PP計算" },
		description: {
			en: "Share a beatmap with the bot (Momiji), then calculate PP and star rating for the specified play conditions.",
			ja: "Bot（Momiji）へ譜面を共有し、指定したプレイ条件でPPとスターレートを計算します。"
		},
		items: [
			{ command: "/np", description: { en: "Share the selected beatmap with the bot (Momiji). It is stored for five minutes, and estimated PP values for common accuracy levels are also returned.", ja: "選択中のbeatmapをBot（Momiji）へ共有します。対象は5分間保存され、一般的なaccuracyごとのPP概算も返ります。" } },
			{ command: "!with <accuracy/misses/combo/mods ...>", description: { en: "Calculate PP and star rating for the beatmap most recently shared with /np. Run it in a DM with the bot (Momiji). You can specify up to four arguments or run it as !w.", ja: "直前に/npした譜面のPPとスターレートを計算します。Bot（Momiji）のDMで実行してください。引数は4個まで指定でき、 !w でも実行できます。" } }
		]
	},
	{
		icon: "music-note",
		title: { en: "Beatmap updates", ja: "ビートマップの更新" },
		description: {
			en: "Retrieve the official information for the currently selected beatmap.",
			ja: "現在選択しているビートマップの公式情報を再取得します。"
		},
		items: [{
			command: "!update",
			description: { en: "On the song selection screen, select and update a beatmap whose leaderboard is missing or whose information is outdated.", ja: "リーダーボードが表示されない、または情報が古いビートマップを曲選択画面で選んで更新します。" }
		}]
	},
	{
		icon: "gamepad-modern",
		title: { en: "Multiplayer", ja: "マルチプレイ" },
		description: {
			en: "Except for help, these commands can be run only by the host or a referee. Run them in the target match chat.",
			ja: "help以外はホストまたはレフリーのみ実行できます。対象マッチのチャットで実行してください。"
		},
		items: [
			{ command: "!mp help", description: { en: "Show the available multiplayer commands. Alias: !mp h.", ja: "マルチプレイで利用可能なコマンドを表示します。 !mp h でも実行できます。" } },
			{ command: "!mp start [force/<seconds>/cancel]", description: { en: "Start the match normally, force-start it, schedule it to start in 1–300 seconds, or cancel a scheduled start. You can also run it as !mp st.", ja: "通常開始、強制開始、1～300秒後の予約開始、または予約取消を行います。 !mp st でも実行できます。" } },
			{ command: "!mp random <on/off>", description: { en: "Randomly choose the host after each round.", ja: "各ラウンド終了後のホストをランダムに選ぶ設定を切り替えます。" } },
			{ command: "!mp rotation <on/off>", description: { en: "Rotate the host in slot order after each round.", ja: "各ラウンド終了後にスロット順でホストを交代する設定を切り替えます。" } },
			{ command: "!mp abort", description: { en: "Abort the match in progress. Only the actual host can use this. Alias: !mp a.", ja: "進行中のマッチを中断します。ホストのみ利用できます。 !mp a でも実行できます。" } },
			{ command: "!mp map <beatmap_id>", description: { en: "Change the match beatmap using its beatmap ID.", ja: "ビートマップIDを指定してマッチの選択マップを変更します。" } },
			{ command: "!mp host <username>", description: { en: "Specify a username without spaces to transfer host to that player in the match.", ja: "空白を含まないユーザー名を指定し、マッチ内のプレイヤーへhostを移譲します。" } },
			{ command: "!mp invite <message>", description: { en: "Post the current match and beatmap invitation to Discord. Available once per match; alias: !mp inv.", ja: "現在のマッチとビートマップの招待をDiscordへ投稿します。1つのマッチにつき1回だけです。 !mp inv でも実行できます。" } },
			{ command: "!mp battle [top/bp/bancho]", description: { en: "Add a replay ghost from Mamestagram top score, your best play, or official Bancho. Run it again in the same mode to disable it.", ja: "Mamestagramでの最高スコア、自分のベストプレイ、または公式osu!（Bancho）からゴーストを追加します。同じモードでもう一度実行すると解除します。" } }
		]
	},
	{
		icon: "people-roof",
		title: { en: "Joining and creating clans", ja: "クランの参加・作成" },
		description: {
			en: "Always run commands containing a password in a DM with the bot (Momiji), and never reuse your Mamestagram account password.",
			ja: "パスワードを含むコマンドは必ずBot（Momiji）のDMで実行し、Mamestagramアカウントと同じパスワードは使用しないでください。"
		},
		items: [
			{ command: "!clan help", description: { en: "Show clan commands. Alias: !clan h.", ja: "クラン関連のコマンドの一覧を表示します。 !clan h でも実行できます。" } },
			{ command: "!clan create <tag> <name> <password>", description: { en: "Create a clan. The tag must be 1–6 characters, the name 2–16 characters, and the password 2–20 characters; spaces are not allowed. You can also run it as !clan c.", ja: "クランを作成します。tagは1～6文字、nameは2～16文字、passwordは2～20文字で、空白は使えません。 !clan c でも実行できます。" } },
			{ command: "!clan info <tag_or_name>", description: { en: "Show the clan's creation date and lists of its owner, officers, and members. You can also run it as !clan i.", ja: "クランの作成日とリーダー・管理者・メンバー一覧を表示します。 !clan i でも実行できます。" } },
			{ command: "!clan list [page]", description: { en: "List registered clans by page. Alias: !clan l.", ja: "登録されているクランをページ単位で一覧表示します。 !clan l でも実行できます。" } },
			{ command: "!clan join <tag_or_name> <password>", description: { en: "Join a public clan immediately or submit a request to a private clan. Alias: !clan j.", ja: "クランへ即時参加、または参加申請を送ります。 !clan j でも実行できます。" } },
			{ command: "!clan leave", description: { en: "Leave your current clan. The owner must transfer ownership to a member first.", ja: "現在のクランから脱退します。リーダーはメンバーに移譲する必要があります。" } }
		]
	},
	{
		icon: "key",
		title: { en: "Clan owner only", ja: "クランリーダー専用" },
		description: {
			en: "Only the clan owner can run the management commands below. Officers do not currently have permission to run them.",
			ja: "以下の管理コマンドはクランリーダーのみ実行できます。現在、管理者には実行権限がありません。"
		},
		items: [
			{ command: "!clan edit <tag/name> <new_value>", description: { en: "Change the clan tag or name. Alias: !clan e.", ja: "クランのtagまたはnameを変更します。 !clan e でも実行できます。" } },
			{ command: "!clan public <on/off>", description: { en: "Switch the clan between public and private.", ja: "クランを公開にするかプライベートにするかを切り替えます。" } },
			{ command: "!clan pending", description: { en: "Show pending join requests with username and user ID. Alias: !clan p.", ja: "未処理の参加申請をユーザー名とユーザーID付きで表示します。 !clan p でも実行できます。" } },
			{ command: "!clan accept <user_id>", description: { en: "Accept a pending join request by user ID. Alias: !clan a.", ja: "ユーザーIDを指定して参加申請を承認します。 !clan a でも実行できます。" } },
			{ command: "!clan password <new_password>", description: { en: "Change the clan password. Run it in a DM with the bot (Momiji). You can also run it as !clan pwd.", ja: "クランのパスワードを変更します。Bot（Momiji）のDMで実行してください。 !clan pwd でも実行できます。" } },
			{ command: "!clan kick <user_id>", description: { en: "Kick a member by specifying their user ID. The owner cannot target themselves. You can also run it as !clan k.", ja: "ユーザーIDを指定してメンバーをキックします。リーダー自身は対象にできません。 !clan k でも実行できます。" } },
			{ command: "!clan transfer <new_user_id>", description: { en: "Transfer ownership to another member of the clan. The former owner becomes a regular member. You can also run it as !clan t.", ja: "クラン内のメンバーへリーダーを移譲します。元リーダーは通常メンバーになります。 !clan t でも実行できます。" } },
			{ command: "!clan disband", description: { en: "Immediately disband the clan with no confirmation and remove every member. Aliases: !clan delete and !clan d.", ja: "確認なしでクランを解散し、全メンバーの所属を解除します。 !clan delete や !clan d でも実行できます。" } }
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
		introTitle: "What is Mamestagram?",
		introLead: "Mamestagram is an osu! community server with a dedicated leaderboard for every play mode, including Relax and Autopilot scores that are not ranked on official servers.",
		introBody: "Players can earn score and PP (Performance Points), compete for the server's #1 spot, and play beatmaps Ranked by the community. They can also connect with other Mamestagram players through Discord chat, multiplayer, and more.",
		introDan: "You can also challenge mode-specific Dans and earn Dan titles by meeting their passing requirements. Dan plays are detected and judged in both osu!stable and osu!lazer.",
		featuresTitle: "Key feature categories",
		features: [
			{
				icon: "display",
				title: "Stable & Lazer",
				body: "Play osu!stable and osu!lazer with the same account."
			},
			{
				icon: "gamepad-modern",
				title: "Vanilla",
				body: "Records standard-play scores just like the official server."
			},
			{
				icon: "computer-mouse",
				title: "Relax",
				body: "Records Relax scores in osu!, osu!taiko, and osu!catch."
			},
			{
				icon: "location-crosshairs",
				title: "Autopilot",
				body: "Records Autopilot scores in osu!."
			},
			{
				icon: "medal",
				title: "Dans",
				body: "Detects and judges mode-specific Dans in both osu!stable and osu!lazer."
			}
		],
		communityTitle: "Discord community channels",
		communityFeatures: [
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
				channel: "# nominate / # maplist",
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
		rulesLead: "Thank you for joining Mamestagram. The following rules must be strictly followed while playing on Mamestagram. There are rules for both the private server and Discord, so read them carefully before participating. The administration may suspend accounts without warning when rules are not followed. By joining the server, you agree to these rules.",
		discordRulesTitle: "Prohibited acts on Discord",
		serverRulesTitle: "Prohibited acts on the server",
		discordRules: [
			"Acts that cause inconvenience to members, such as spam or posting phishing URLs.",
			"Sending messages that put a load on members' devices.",
			"Advertising other servers.",
			"Discriminatory language, hatred, or discrimination based on race, gender, religion, creed, social status, or sexual orientation.",
			"Making excessively abusive remarks.",
			"Malicious impersonation of other users.",
			"Distributing cheats, viruses, or self-made software.",
			"Posting or attaching NSFW content.",
			"Any act deemed inappropriate by the administration or a large number of users."
		],
		serverRules: [
			"Creating alternate accounts. Creating one results in an automatic restriction.",
			"Submitting plays made with a cheat engine.",
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
		reportBody: "If you witness or discover misconduct, report it through support.",
		reportWarning: "False reports may result in account restrictions.",
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
		commandsLead: "These are the general-player commands currently available in osu!stable. Prefix them with ! and run them from in-game chat.",
		commandTips: [
			{ icon: "messages", title: "Where to run commands", body: "We recommend running normal settings and query commands in a DM with the bot (Momiji). Run !mp only in the target match chat." },
			{ icon: "terminal", title: "How to read syntax", body: "<value> is required, [value] is optional, and <a/b> means a or b. Command names are case-insensitive, but lowercase arguments are the safest choice." },
			{ icon: "gamepad-modern", title: "Permissions", body: "Some commands are available only to Supporters, match hosts, or clan owners. Restricted or silenced accounts may be unable to run commands." }
		],
		commandsSource: "Open the current command channel",
		dansLead: "Dan Courses are structured challenges with mode-specific clear requirements. Passing a course raises your player level by the level of that challenge.",
		downloadAll: "Download all Dan maps",
		danChannel: "Open # dan",
		courses: "Featured courses",
		downloadMode: "Download maps",
		danHeaders: ["Course", "Level", "Key count", "Acc", "Score", "Mod", "Miss count", "Combo count"],
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
		introTitle: "Mamestagramとは",
		introLead: "Mamestagramは、公式サーバーではランキング対象にならないRelaxやAutopilotを含め、各プレイモードごとに専用のリーダーボードを備えた、osu!コミュニティサーバーです。",
		introBody: "プレイヤーはスコアとPP（Performance Point）を獲得し、サーバー内1位を競いあったり、コミュニティによってRankedとなったビートマップをプレイしたりできます。また、Discordのチャットやマルチプレイなどを通じて、Mamestagram内のプレイヤーと交流することができます。",
		introDan: "さらに、モード別に用意された段位に挑戦でき、合格条件を満たしてクリアすることで段位の称号を獲得できます。段位のプレイ検出と判定はosu!stableとosu!lazerの両方に実装されています。",
		featuresTitle: "主要な機能カテゴリー",
		features: [
			{
				icon: "display",
				title: "Stable & Lazer",
				body: "同一アカウントでosu!stableとosu!lazerをプレイできます。"
			},
			{
				icon: "gamepad-modern",
				title: "Vanilla",
				body: "公式サーバーと同様、標準プレイのスコアを記録します。"
			},
			{
				icon: "computer-mouse",
				title: "Relax",
				body: "osu!、osu!taiko、osu!catchにてRelaxのスコアが記録されます。"
			},
			{
				icon: "location-crosshairs",
				title: "Autopilot",
				body: "osu!にてAutopilotのスコアが記録されます。"
			},
			{
				icon: "medal",
				title: "Dans",
				body: "モード別で段位をosu!stable/osu!lazerの両方で検出・判定します。"
			}
		],
		communityTitle: "Discordチャンネルの主な機能",
		communityFeatures: [
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
		reportBody: "不正行為を目撃・発見した場合は、supportにて運営へ報告してください。",
		reportWarning: "虚偽の申告はアカウントの制限対象になります。",
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
		commandsLead: "現在osu!stableから利用できる、一般プレイヤー向けコマンドです。先頭に ! を付け、ゲーム内チャットから実行してください。",
		commandTips: [
			{ icon: "messages", title: "実行する場所", body: "通常の設定変更や照会コマンドはBot（Momiji）のDMでの実行を推奨します。!mpだけは対象マッチのチャットで実行してください。" },
			{ icon: "terminal", title: "入力表記", body: "<value>:必須、[value]:省略可能、<a/b>:a or b。コマンドは大文字・小文字を区別しませんが、引数は小文字で入力するのが安全です。" },
			{ icon: "gamepad-modern", title: "利用条件", body: "一部はサポーター、マッチホスト、クランリーダー専用コマンドです。制限中またはサイレンス中のアカウントでは実行できない場合があります。" }
		],
		commandsSource: "最新のコマンドチャンネルを開く",
		dansLead: "段位はモードごとに合格条件が設定されたチャレンジです。クリアすると、挑戦した段位レベルに応じてプレイヤーレベルが上がります。",
		downloadAll: "段位マップをまとめてダウンロード",
		danChannel: "# danを開く",
		courses: "主なコース",
		downloadMode: "マップをダウンロード",
		danHeaders: ["コース", "レベル", "キー数", "Acc", "スコア", "Mod", "ミス数", "コンボ数"],
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
