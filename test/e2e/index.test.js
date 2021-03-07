const {
  pages: { terms, logView },
} = require("./");
const sampleVideos = require("./sample-videos.json");

/** @param {("youtube" | "paravi")} platform */
const sample = (platform = "youtube") =>
  sampleVideos[platform][
    Math.floor(Math.random() * sampleVideos[platform].length)
  ];

beforeAll(async () => {
  page = await terms.page(browser);
  await Promise.all(
    (await browser.pages()).filter((p) => p !== page).map((p) => p.close())
  );
  await Promise.all(
    ["#terms", "#privacy"].map((selector) => page.click(selector))
  );
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.click("#submit"),
  ]);
});

const path = require("path");
afterEach(async () => {
  await page.screenshot({
    path: path.join("screenshots", `${Date.now()}.png`),
  });
  if (page.url().match(/^https?:\/\//)) {
    [page] = await Promise.all([browser.newPage(), page.close()]);
  }
});

test("利用規約とプライバシーポリシーに同意後、Welcome画面が表示", async () => {
  await page.waitForNavigation({ waitUntil: "domcontentloaded" });
  expect(new URL(page.url()).pathname).toBe(logView.pathname);
  expect(new URL(page.url()).hash).toBe("#/welcome");
});

// FIXME: 広告を回避できずエラーになるのでリトライ
jest.retryTimes(3);
test("YouTube動画に埋め込み", async () => {
  const videomark = "#__videomark_ui";
  await page.goto(sample("youtube"));
  await page.waitFor(videomark);
}, 90e3);

test("YouTube動画に埋め込み (モバイル)", async () => {
  const videomark = "#__videomark_ui";
  const pixel2 = require("puppeteer").devices["Pixel 2"];
  await page.emulate(pixel2);
  await page.goto(sample("youtube").replace("//www.", "//m."));
  await page.waitFor(videomark);
  await page.click(videomark);
}, 90e3);

// FIXME: GitHub Actions runner ホストが Paravi 視聴に対応していない地域なのでスキップ
test.each(["youtube" /*, "paravi"*/])(
  "%s: 動画に埋め込み後、しばらく経つとQoE値が得られる",
  async (platform) => {
    const videomark = "#__videomark_ui";
    await page.goto(sample(platform));
    await page.waitFor(videomark);
    const summary = await page.evaluateHandle(
      (selector) =>
        document
          .querySelector(selector)
          .shadowRoot.querySelector(".root > details > summary"),
      videomark
    );
    const summaryText = () =>
      page.evaluate((el) => el.textContent.trim(), summary);
    expect(await summaryText()).toBe("計測中...");
    await page.click(videomark);
    await page.waitFor(
      (el) => el.textContent.trim() !== "計測中...",
      { timeout: 60e3 },
      summary
    );
    expect(await summaryText()).toMatch(/^\d{1}\.\d{2}\s/);
  },
  90e3
);

test("YouTubeトップから動画ページに移動し、ビットレートを検知", async () => {
  await page.goto("https://www.youtube.com/");
  await page.type("#search", "red panda");
  await page.click("#search-icon-legacy");

  const thumbnail = ".ytd-video-renderer #thumbnail";
  await page.waitFor(thumbnail);
  await page.click(thumbnail);

  const videomark = "#__videomark_ui";
  await page.waitFor(videomark);
  await page.click(videomark);
  await page.waitFor(1000);

  const bitrate = await page.evaluateHandle(
    (selector) =>
      document.querySelector(selector)
        .shadowRoot.querySelector(".root > details > dl > dd"),
    videomark
  );
  const bitrateText = () => page.evaluate((el) => el.textContent.trim(), bitrate);

  await page.waitFor(
    (el) => el.textContent.trim() !== "n/a",
    { timeout: 60e3 },
    bitrate
  );
  expect(await bitrateText()).toMatch(/^\d+(\.\d+)?\skbps/);
}, 90e3);
