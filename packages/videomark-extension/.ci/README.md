# videomark-extension-test

VideoMark Extension のテスト環境

## Usage

```sh
sudo apt-get install -y chromium-browser
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install
npm test
```

## 既知の問題

Snap パッケージ版 Chromium の場合、 "Failed to load extension from: . Manifest file is missing or unreadable" というメッセージが表示され拡張機能の読み込みに失敗し、テストを実行できない。

## 実行環境

Ubuntu 18.04
