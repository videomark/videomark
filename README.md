![build](https://github.com/videomark/videomark-log-view/workflows/build/badge.svg?branch=master)
[![Netlify Status](https://api.netlify.com/api/v1/badges/381b781f-df6b-451a-829e-d15634b9b72f/deploy-status)](https://app.netlify.com/sites/videomark-log-view/deploys)

# 開発環境

Node.js v10.6.0

# ビルド方法

公開用のビルドを行う。
実行後に build ディレクトリが作られその中に成果物が入る。

```sh
npm run build
```

## Android Browser 同梱用ビルド

```sh
npm run build-android
```

# 更新方法

## ChromeExtension

1. ChromeExtension/qoelog ディレクトリの中身を全て削除
2. ビルドしてできた build ディレクトリの中身を ChromeExtension/qoelog にコピー

# コマンド

## `npm start`

develop モードでアプリケーションの起動をする。
[http://localhost:3000](http://localhost:3000) をブラウザで開く。

# develop モードでの確認方法

ブラウザのストレージに存在するデータをロードして画面を構築するため開発モードで実行するとデータのロードが行えず、空データの時と同じ挙動をする。
develop モードで確認をする場合、[Chrome Extension の README に記載の手順](https://github.com/videomark/videomark-extension/) でエクスポートしたストレージデータを [EmbeddedData.js](https://github.com/videomark/videomark-log-view/blob/master/src/js/utils/ChromeExtensionWrapper/EmbeddedData.js) に埋め込めば確認が可能。

# 開発者向け機能

## ルーティング一覧

| エンドポイント          | 説明                   |
| ----------------------- | ---------------------- |
| `index.html#/stats`     | 統計                   |
| `index.html#/import`    | 計測結果のインポート   |
| `index.html#/export`    | 計測結果のエクスポート |
| `index.html#/migration` | 最新のデータ形式に移行 |
| `index.html#/rollback`  | 以前のデータ形式に戻す |

## 計測時のセッション ID の変更

`index.html#/settings?session_id={セッション ID}` にアクセスすると指定したセッション ID に設定される。
この時設定されるデフォルトの有効期限は 10 年間。
