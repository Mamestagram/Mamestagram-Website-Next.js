# AGENTS.md

## Project

Mamestagram Web

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- MySQL

## Coding Rules

- TypeScript strict
- anyは禁止
- unknownを優先する
- ESLintエラーを出さない
- Prettierに従う
- クエリはdatabase/queryの中に書く
- なるべく他のファイルのコードと書き方を統一する
- 内部リンクはLinkタグで外部リンクはaタグを使う
- Imageタグには必ずaltに値を入れ、draggableをfalseにする

### React

- Server Componentsを優先
- Client Componentsは必要な場合のみ
- "use client"は最小限
- header、footerタグは使わない

### Components

- コンポーネントは責務ごとに分割する
- 共通化できるものは components に配置
- JSX.Elementを返すfunctionは別ファイルにする

### Styles

- cssファイルはpublic/stylesの中に入れる
- カスタムプロパティは初期値を指定する

### API

- Route Handlersを使用
- エラーハンドリングを書く（自身のapiは不必要）
- fetchを利用する

## Do Not

- package.jsonを勝手に変更しない
- ライブラリを追加しない
- ディレクトリ構成を変更しない