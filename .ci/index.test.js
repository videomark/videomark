const {
  pages: { terms, logView }
} = require("./");

beforeAll(async () => {
  page = await terms.page(browser);
  await Promise.all(
    (await browser.pages()).filter(p => p !== page).map(p => p.close())
  );
  await Promise.all(
    ["#terms", "#privacy"].map(selector => page.click(selector))
  );
  await Promise.all([page.waitForNavigation(), page.click("#submit")]);
});

const path = require("path");
afterEach(async () => {
  await page.screenshot({
    path: path.join("screenshots", `${Date.now()}.png`)
  });
});

test(`利用規約とプライバシーポリシーに同意後、logView (${
  logView.pathname
})が表示`, () => {
  expect(new URL(page.url()).pathname).toBe(logView.pathname);
});
test("YouTube動画に埋め込み", async () => {
  const demoVideo = "https://www.youtube.com/watch?v=mY6sChi65oU";
  const videomark = "#__videomark_ui";
  await page.goto(demoVideo);
  await page.waitFor(videomark);
});
