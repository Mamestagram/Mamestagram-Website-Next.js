# Mamestagram Web

[English](#english) | [日本語](#日本語)

## English

Mamestagram Web is the official website for Mamestagram, an osu! private server.
It provides player and clan profiles, rankings, beatmap information, server guides, and more.

- Website: [web.mamesosu.net](https://web.mamesosu.net/)
- Community: [Mamestagram Discord](https://discord.com/invite/xqncGVrHSf)

### Features

- Dashboard with server status, top players, and recent activity
- Player and clan leaderboards with selectable modes, ranking categories, and scopes
- Player and clan profiles with statistics, scores, and ranking history
- Beatmap information, score rankings, and replay playback
- Unified search for players, clans, and beatmaps
- User and clan settings for profile images, Me!, profile visibility, and more
- Documentation for connecting to Mamestagram, commands, rules, and BBCode
- Information about osu!lazer and supporters
- Profile cosmetics and custom loading screen integration with Badge Market
- Mobile and tablet support

### Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- MySQL
- Redis
- CSS Modules

### Directory Structure

```text
src/
├── actions/       Server Actions
├── app/           Pages, layouts, and Route Handlers
├── components/    UI components
├── database/      Data access and queries
└── lib/           Shared utilities

public/
├── images/        Image assets
└── styles/        Global CSS and CSS Modules
```

See [`AGENT.md`](./AGENT.md) for the implementation rules.

### Bugs and Feature Requests

Please report bugs in the Mamestagram Discord
[`#bug-report`](https://discord.com/channels/944248031136587796/1117062398596108298) channel.
Share improvement ideas and feature requests in
[`#idea`](https://discord.com/channels/944248031136587796/1200023545015697529).

## 日本語

osu!プライベートサーバー「Mamestagram」の公式Webサイトです。
プレイヤーとクランのプロフィール、ランキング、ビートマップ情報、サーバーガイドなどを提供します。

- Webサイト: [web.mamesosu.net](https://web.mamesosu.net/)
- コミュニティー: [Mamestagram Discord](https://discord.com/invite/xqncGVrHSf)

### 主な機能

- サーバー状況、トッププレイヤー、最近のアクティビティを表示するダッシュボード
- モード、集計方法、対象範囲を切り替えられるプレイヤー・クランランキング
- プレイヤーとクランのプロフィール、統計、スコア、ランキング履歴
- ビートマップ情報、スコアランキング、リプレイ再生
- プレイヤー、クラン、ビートマップの横断検索
- プロフィール画像、Me!、公開範囲などのユーザー・クラン設定
- Mamestagramへの接続方法、コマンド、ルール、BBCodeのドキュメント
- osu!lazerおよびサポーターの案内
- バッジマーケットとのプロフィール装飾・カスタムロード画面連携
- モバイル・タブレット対応

### 技術構成

- Next.js 16（App Router）
- React 19
- TypeScript
- MySQL
- Redis
- CSS Modules

### ディレクトリ

```text
src/
├── actions/       Server Actions
├── app/           ページ、レイアウト、Route Handlers
├── components/    UIコンポーネント
├── database/      データ取得処理とクエリ
└── lib/           共通処理

public/
├── images/        画像アセット
└── styles/        グローバルCSSとCSS Modules
```

実装時のルールは [`AGENT.md`](./AGENT.md) を参照してください。

### 不具合・要望

不具合はMamestagram Discordの
[`#bug-report`](https://discord.com/channels/944248031136587796/1117062398596108298)、
改善案や追加してほしい機能は
[`#idea`](https://discord.com/channels/944248031136587796/1200023545015697529)へお知らせください。
