import { NextResponse } from "next/server";

const mediaRoot = "/images/documents/support";

const supportData = {
	links: {
		koFi: "https://ko-fi.com/mamestagram/tiers"
	},
	mediaRoot,
	copy: {
		en: {
			title: "Support",
			description: "Support the future of Mamestagram and unlock more ways to play.",
			language: "Language",
			nav: { introduction: "Introduction", features: "Features", subscription: "Subscription" },
			introTitle: "Built with the community",
			intro: [
				"Thank you for always playing Mamestagram. We are building a private osu! server that aims to reshape the way players experience the game.",
				"What started as a high-school project has continued for years thanks to the support of our community. Your contribution helps us keep developing and operating Mamestagram."
			],
			perksTitle: "Supporter benefits",
			perksLead: "Compare the standard experience with the additional features available to Mamestagram Supporters.",
			labels: { free: "Free", supporter: "Supporter", available: "Available", unavailable: "Not available", comingSoon: "Coming soon" },
			subscriptionTitle: "Become a Supporter",
			subscriptionLead: "Join Mamestagram's membership on Ko-fi. Supporter status is automatically assigned to your account after joining.",
			cancelNote: "Even if you cancel immediately, your Supporter status remains active until the corresponding date in the following month.",
			price: "Starts at $5",
			priceCaption: "Longer terms may receive up to 20% off.",
			pricing: {
				title: "Price estimator",
				description: "Choose a base term from 4 to 48 weeks. Eligible purchases receive 20% more Supporter time.",
				total: "Selected term",
				weeks: "weeks",
				save: "Save",
				off: "off",
				standard: "Standard price",
				input: "Supporter term in weeks",
				rangeError: "Enter a whole number from 4 to 48."
			},
			assignment: "Automatic activation",
			assignmentCaption: "Your account receives Supporter status after joining.",
			ctaTitle: "Ready to support Mamestagram?",
			ctaBody: "Continue to the official Ko-fi membership page to choose your Supporter tier.",
			cta: "View Supporter tiers",
			backToTop: "Back to top"
		},
		ja: {
			title: "サポート",
			description: "Mamestagramのこれからを支援して、より多くの遊び方を楽しみましょう。",
			language: "言語",
			nav: { introduction: "はじめに", features: "追加機能", subscription: "サポーター申込" },
			introTitle: "コミュニティとともに",
			intro: [
				"いつもMamestagramをプレイしていただきありがとうございます。私たちは、これまでのosu!体験を一新するプライベートサーバーを目指して開発を続けています。",
				"高校生の頃に始まったこのプロジェクトを何年も運営できているのは、コミュニティの皆さまのおかげです。皆さまからの支援は、Mamestagramの開発と運営に活用されます。"
			],
			perksTitle: "サポーター特典",
			perksLead: "通常の状態とMamestagram Supporterで利用できる追加機能を比較できます。",
			labels: { free: "通常", supporter: "サポーター", available: "利用できます", unavailable: "利用できません", comingSoon: "近日公開" },
			subscriptionTitle: "サポーターになる",
			subscriptionLead: "Ko-fiでMamestagramのメンバーシップに参加すると、アカウントへサポーター権限が自動的に付与されます。",
			cancelNote: "加入後すぐにキャンセルした場合でも、翌月の同日まではサポーターの状態が維持されます。",
			price: "$5から",
			priceCaption: "長期購入では最大20%の割引が適用されます。",
			pricing: {
				title: "料金シミュレーター",
				description: "4週間から48週間までの基準期間を選択できます。対象の購入ではサポーター期間が20%増加します。",
				total: "選択期間",
				weeks: "週間",
				save: "",
				off: "割引",
				standard: "通常料金",
				input: "サポーター期間（週）",
				rangeError: "4〜48の整数を入力してください。"
			},
			assignment: "自動で有効化",
			assignmentCaption: "メンバーシップ参加後、アカウントへ自動的に反映されます。",
			ctaTitle: "Mamestagramを支援しませんか？",
			ctaBody: "公式Ko-fiメンバーシップページでSupporterのプランを選択できます。",
			cta: "Supporterプランを見る",
			backToTop: "トップへ戻る"
		}
	},
	features: {
		en: [
			{
				icon: "users",
				title: "Expanded Friend Leaderboard",
				free: {
					body: "Bancho, clan, and friend rankings are not available.",
					available: false
				},
				supporter: {
					body: "Display Bancho, clan, and friend rankings with !lb friend <bancho/clan/friend>.",
					media: {
						type: "video",
						src: `${mediaRoot}/ex-friend-lb-51.mp4`,
						alt: "Supporter friend leaderboard"
					}
				}
			},
			{
				icon: "list-ol",
				title: "Leaderboard Display Count",
				free: {
					body: "Leaderboards display up to the top 100 players.",
					media: { type: "video", src: `${mediaRoot}/lb-display-3.mp4`, alt: "Standard leaderboard size" }
				},
				supporter: {
					body: "Display between 100 and 500 players with !lb size <100-500>.",
					media: { type: "video", src: `${mediaRoot}/lb-display-51.mp4`, alt: "Expanded leaderboard size" }
				}
			},
			{
				icon: "ranking-star",
				title: "Score-based Ranking",
				free: {
					body: "Player rankings are displayed using PP.",
					media: { type: "image", src: `${mediaRoot}/score-based-3.png`, alt: "PP-based ranking" }
				},
				supporter: {
					body: "Switch between score and PP ranking with !gamemode <score/pp>.",
					media: { type: "image", src: `${mediaRoot}/score-based-51.png`, alt: "Score-based ranking" }
				}
			},
			{
				icon: "badge-check",
				title: "Supporter Role",
				free: {
					body: "The profile is displayed without a Supporter badge.",
					media: { type: "image", src: `${mediaRoot}/role-3.png`, alt: "Profile without supporter badge" }
				},
				supporter: {
					body: "A dedicated Supporter badge is added to your profile page.",
					media: { type: "image", src: `${mediaRoot}/role-51.png`, alt: "Profile with supporter badge" }
				}
			},
			{
				icon: "table-columns",
				title: "Profile Layout Editor",
				free: {
					body: "Profile layout customization is not available.",
					available: false
				},
				supporter: {
					body: "Arrange, resize, and customize the colors of your profile contents with the profile UI editor.",
					media: { type: "image", src: `${mediaRoot}/profile-ui.png`, alt: "Profile layout editor with toolbox and content preview" }
				}
			},
			{
				icon: "hourglass-half",
				title: "Coming Soon",
				free: {
					body: "More features are on the way. Stay tuned for future updates.",
					available: false,
					comingSoon: true
				},
				supporter: {
					body: "More features are on the way. Stay tuned for future updates.",
					available: false,
					comingSoon: true
				}
			}
		],
		ja: [
			{
				icon: "users",
				title: "フレンドリーダーボードの拡張",
				free: {
					body: "Bancho・クラン・フレンドのランキングは表示できません。",
					available: false
				},
				supporter: {
					body: "!lb friend <bancho/clan/friend>でBancho・クラン・フレンドのランキングを表示できます。",
					media: {
						type: "video",
						src: `${mediaRoot}/ex-friend-lb-51.mp4`,
						alt: "Supporterのフレンドリーダーボード"
					}
				}
			},
			{
				icon: "list-ol",
				title: "リーダーボード表示数の変更",
				free: {
					body: "リーダーボードは100位まで表示されます。",
					media: { type: "video", src: `${mediaRoot}/lb-display-3.mp4`, alt: "通常のリーダーボード表示数" }
				},
				supporter: {
					body: "!lb size <100-500>で100位から500位まで表示数を変更できます。",
					media: {
						type: "video",
						src: `${mediaRoot}/lb-display-51.mp4`,
						alt: "拡張されたリーダーボード表示数"
					}
				}
			},
			{
				icon: "ranking-star",
				title: "スコア基準の順位表示",
				free: {
					body: "プレイヤーランキングはPPを基準に表示されます。",
					media: { type: "image", src: `${mediaRoot}/score-based-3.png`, alt: "PP基準のランキング" }
				},
				supporter: {
					body: "!gamemode <score/pp>でスコア基準とPP基準を切り替えられます。",
					media: { type: "image", src: `${mediaRoot}/score-based-51.png`, alt: "スコア基準のランキング" }
				}
			},
			{
				icon: "badge-check",
				title: "サポーターバッジ",
				free: {
					body: "プロフィールにはサポーターバッジが表示されません。",
					media: { type: "image", src: `${mediaRoot}/role-3.png`, alt: "サポーターバッジなしのプロフィール" }
				},
				supporter: {
					body: "プロフィールページに専用のサポーターバッジが追加されます。",
					media: { type: "image", src: `${mediaRoot}/role-51.png`, alt: "サポーターバッジ付きプロフィール" }
				}
			},
			{
				icon: "table-columns",
				title: "プロフィールUIエディタ",
				free: {
					body: "プロフィールのレイアウトをカスタマイズすることはできません。",
					available: false
				},
				supporter: {
					body: "プロフィールUIエディタでコンテンツの配置・サイズ・色を自由にカスタマイズできます。",
					media: { type: "image", src: `${mediaRoot}/profile-ui.png`, alt: "ツールボックスとコンテンツのプレビューを表示したプロフィールUIエディタ" }
				}
			},
			{
				icon: "hourglass-half",
				title: "近日公開",
				free: {
					body: "新しい機能を準備中です。今後のアップデートをお楽しみに。",
					available: false,
					comingSoon: true
				},
				supporter: {
					body: "新しい機能を準備中です。今後のアップデートをお楽しみに。",
					available: false,
					comingSoon: true
				}
			}
		]
	}
} as const;

export type SupportData = typeof supportData;

export const GET = (): NextResponse<SupportData> => {
	return NextResponse.json(supportData);
};
