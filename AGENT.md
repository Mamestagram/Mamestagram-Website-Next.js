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
- cssのカスタムプロパティは初期値を指定する
- なるべく他のファイルのコードと書き方を統一する

### React
- Server Componentsを優先
- Client Componentsは必要な場合のみ
- "use client"は最小限

### Components
- コンポーネントは責務ごとに分割する
- 共通化できるものは components に配置

### API
- Route Handlersを使用
- エラーハンドリングを書く（自身のapiは不必要）
- fetchを利用する

## Do Not
- package.jsonを勝手に変更しない
- ライブラリを追加しない
- ディレクトリ構成を変更しない