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

const downloadExtension = async () => {
  const url = "https://sodium-extension.netlify.app/";
  const path = require("path").join(
    require("os").tmpdir(),
    "videomark-extension"
  );
  require("fs").mkdirSync(path);
  require("child_process").execSync(
    'curl -sL "${VIDEOMARK_EXTENSION_URL}" -o dist.zip && unzip dist.zip && rm dist.zip',
    { cwd: path, env: { VIDEOMARK_EXTENSION_URL: url } }
  );
  return path;
};

module.exports = async () => {
  // NOTE: ローカルディレクトリにビルドが存在する場合、それを使う
  const extensionPath =
    fileExists("../../dist/production") || (await downloadExtension());
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
