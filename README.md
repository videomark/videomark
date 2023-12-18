[![Netlify Status](https://api.netlify.com/api/v1/badges/0d2a4ed0-102a-47db-8291-c241d66a909b/deploy-status)](https://app.netlify.com/sites/sodium-extension/deploys)

# Web VideoMark Project

Web VideoMark プロジェクトの紹介、ツールのダウンロード、使用法などの説明は [Web VideoMark の Web サイト](https://videomark.webdino.org/) をご覧ください。

## Develop Environment

- bash: any
- node: [see also .nvmrc](.nvmrc)
- pnpm: latest

## Build Instructions

```sh
git clone git@github.com:videomark/videomark.git
cd videomark
corepack enable pnpm
pnpm install
pnpm build
```

## Install

### Chrome

1. ツールバーの 3 点メニューを開き、「拡張機能」から「拡張機能を管理」を選択
1. 「拡張機能」タブが開いたら「デベロッパーモード」を有効化
1. 「パッケージ化されていない拡張機能を読み込む」をクリック
1. このリポジトリ以下の `dist/production-chrome` ディレクトリを選択

### Firefox

1. `about:debugging#/runtime/this-firefox` を開く
1. 「一時的なアドオンを読み込む」をクリック
1. このリポジトリ以下の `dist/production-firefox/manifest.json` ファイルを選択

## Development

`pnpm build:watch` を実行すると、ローカルで行った変更の差分が随時自動的に `dist/production-*` へビルドされます。反映にはページの再読み込みが必要です。ファイルによっては再度 `pnpm build` を実行しないと更新されない場合もあります。

## Directories

- [sodium](src/content/sodium) [![Netlify Status](https://api.netlify.app/api/v1/badges/2557c75c-0b3c-450b-b4dc-0f7b9fda88dd/deploy-status)](https://app.netlify.app/sites/sodium-js/deploys)
  - 動画配信サービス利用時に計測を行うためのコンテンツスクリプト

## Repositories

- [aggregate-server](https://github.com/videomark/aggregate-server)
  - QoE 値集計結果の取得を行うサーバー
- [aggregator](https://github.com/videomark/aggregator)
  - QoE 値集計を行う node アプリケーション
- [fluentd-config](https://github.com/videomark/fluentd-config)
  - fluentd の設定ファイルなど
- [sodium-bot](https://github.com/videomark/sodium-bot)
  - 動画配信サービスの視聴品質の自動計測のためのスクリプト
- [videomark-browser](https://github.com/videomark/videomark-browser)
  - Android 向けカスタムブラウザ作成のためのパッチファイル
  - Chromium のソースツリーに適用してビルドするためのパッチ集です

## Wiki

プロジェクト共通のメモなどは [Wiki](https://github.com/videomark/videomark/wiki) を参照してください。
