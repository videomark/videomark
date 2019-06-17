const puppeteer = require("puppeteer");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { get } = require("https");
const { execSync } = require("child_process");

const downloadExtension = async () => {
  const url =
    "https://sodium-extension.netlify.com/production/webvideomark.zip";
  const extensionPath = path.join(os.tmpdir(), "videomark-extension");
  fs.mkdirSync(extensionPath);
  const dist = fs.createWriteStream(path.join(extensionPath, "dist.zip"));
  await new Promise(resolve =>
    get(url, res => {
      res.pipe(dist);
      res.on("end", resolve);
    })
  );
  dist.close();
  execSync("unzip dist.zip && rm dist.zip", { cwd: extensionPath });
  return extensionPath;
};

module.exports = async () => {
  const extensionPath = await downloadExtension();
  const browser = await puppeteer.launch({
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
