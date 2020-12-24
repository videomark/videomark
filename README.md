![build](https://github.com/videomark/videomark/workflows/build/badge.svg?branch=master)
![e2e](https://github.com/videomark/videomark/workflows/e2e/badge.svg?branch=master)
[![Netlify Status](https://api.netlify.com/api/v1/badges/0d2a4ed0-102a-47db-8291-c241d66a909b/deploy-status)](https://app.netlify.com/sites/sodium-extension/deploys)

# Web VideoMark Project

Web VideoMark プロジェクトの紹介、ツールのダウンロード、使用法などの説明は [Web VideoMark の Web サイト](https://vm.webdino.org/) をご覧ください。

## Develop Environment

- bash: any
- node: 12.* (or higher)
- yarn: latest

## Build Instructions

```sh
git clone git@github.com:videomark/videomark.git
cd videomark
yarn build
./bin/build
```

## Install

1. Chrome のメニューで「その他のツール」から「拡張機能」を選択
2. 「拡張機能」タブの「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このリポジトリに配置される dist/production ディレクトリを選択

## Directories

- [sodium](packages/sodium) [![Netlify Status](https://api.netlify.app/api/v1/badges/2557c75c-0b3c-450b-b4dc-0f7b9fda88dd/deploy-status)](https://app.netlify.app/sites/sodium-js/deploys)
  - 動画配信サービス利用時に計測を行うためのコンテンツスクリプト
- [videomark-extension](packages/videomark-extension) [![Netlify Status](https://api.netlify.app/api/v1/badges/0d2a4ed0-102a-47db-8291-c241d66a909b/deploy-status)](https://app.netlify.app/sites/sodium-extension/deploys)
  - Google Chrome / Mozilla Firefox 拡張機能のベースとなるファイル群
- [videomark-log-view](packages/videomark-log-view) [![Netlify Status](https://api.netlify.app/api/v1/badges/381b781f-df6b-451a-829e-d15634b9b72f/deploy-status)](https://app.netlify.app/sites/videomark-log-view/deploys)
  - 計測結果の表示を行うページ
- [videomark-mini-stats](packages/videomark-mini-stats)
  - 計測結果を画像として保存する機能

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
