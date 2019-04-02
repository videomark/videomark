[![Netlify Status](https://api.netlify.com/api/v1/badges/381b781f-df6b-451a-829e-d15634b9b72f/deploy-status)](https://app.netlify.com/sites/videomark-log-view/deploys)

# 開発環境
Node.js v10.6.0  

# ビルド方法 

## Mobile
`npm run build`

## Android Browser 同梱用ビルド

普通にビルドして build ディレクトリを使う。

`build-for-android.sh` で不要ファイル削除まで実行する。

## Chrome Extension 同梱用ビルド

環境変数に `PUBLIC_URL=/qoelog` を設定し`npm run build`を行う。  
`build-for-chrome.sh` を実行してもビルドが可能。  

# 更新方法

## ChromeExtension
1. ChromeExtension/qoelog ディレクトリの中身を全て削除
2. ビルドしてできた qoe-log ディレクトリの中身を ChromeExtension/qoelog にコピー

# コマンド
## `npm start`
develop モードでアプリケーションの起動をする。  
[http://localhost:3000](http://localhost:3000) をブラウザで開く。

## `npm run build`
公開用のビルドを行う。
実行後に build ディレクトリが作られその中に成果物が入る。

# developモードでの確認方法
ブラウザのストレージに存在するデータをロードして画面を構築するため開発モードで実行するとデータのロードが行えず、空データの時と同じ挙動をする。  
developモードで確認をする場合 [EmbededData.js](https://github.com/webdino/sodium/blob/master/qoe-log-view/src/js/EmbededData.js) にストレージのデータを埋め込めば確認が可能。
