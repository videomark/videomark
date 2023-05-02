![build](https://github.com/videomark/videomark/workflows/build/badge.svg?branch=master)
![e2e](https://github.com/videomark/videomark/workflows/e2e/badge.svg?branch=master)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/videomark/videomark.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/videomark/videomark/context:javascript)
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
# Playwright/Puppeteer のインストールスクリプトは実行しない
pnpm install --ignore-scripts
pnpm build
```

## Install

1. Chrome のメニューで「その他のツール」から「拡張機能」を選択
2. 「拡張機能」タブの「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このリポジトリに配置される `dist/production` ディレクトリを選択

## Development

`pnpm run build:watch` を実行すると、ローカルで行った変更が随時自動的に `dist/production` へビルドされます。反映にはページの再読み込みが必要です。

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
