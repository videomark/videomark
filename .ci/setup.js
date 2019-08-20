const puppeteer = require("puppeteer");

const downloadExtension = async () => {
  const url = "https://sodium-extension.netlify.com/";
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
  const extensionPath = await downloadExtension();
  process.env.LANG = "C";
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ],
    headless: false
  });
  process.env.PUPPETEER_WS_ENDPOINT =
    process.env.PUPPETEER_WS_ENDPOINT || browser.wsEndpoint();
  global.__VIDEOMARK_EXTENSION_PATH__ = extensionPath;
  global.__BROWSER__ = browser;
};
