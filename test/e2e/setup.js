const assert = require("assert");
const fs = require("fs");
const puppeteer = require("puppeteer");

const fileExists = (path) => {
  try {
    fs.statSync(path);
    return path;
  } catch (e) {
    return null;
  }
};

module.exports = async () => {
  // NOTE: 最近(2022-11-28)の本番系は最新QoEが得られるまでの遅延が大きくなりつつあるので dev-sodium.webdino.org を使用
  const extensionPath = fileExists("../../dist/development");
  assert(
    extensionPath,
    `拡張機能が存在しません。ビルド後に再実行してください。${extensionPath}`
  );
  // NOTE: Paravi で再生できないので日本のタイムゾーンに強制
  process.env.TZ = "Asia/Tokyo";
  process.env.LANG = "C";
  const browser = await puppeteer.launch({
    executablePath:
      fileExists("/usr/bin/google-chrome") || "/usr/bin/chromium-browser",
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
    headless: false,
  });
  process.env.PUPPETEER_WS_ENDPOINT =
    process.env.PUPPETEER_WS_ENDPOINT || browser.wsEndpoint();
  global.__VIDEOMARK_EXTENSION_PATH__ = extensionPath;
  global.__BROWSER__ = browser;
};
