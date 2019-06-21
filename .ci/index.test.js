const {
  pages: { terms, logView }
} = require("./");

let extensionPage;
beforeAll(async () => {
  const page = await terms.page(browser);
  await page.bringToFront();
  await Promise.all(
    ["#terms", "#privacy"].map(selector => page.click(selector))
  );
  await page.click("#submit");
  extensionPage = page;
});
test(`利用規約とプライバシーポリシーに同意後、logView (${
  logView.pathname
})が表示`, async () => {
  expect(new URL(extensionPage.url()).pathname).toBe(logView.pathname);
});
test("YouTube動画に埋め込み", async () => {
  const demoVideo = "https://www.youtube.com/watch?v=mY6sChi65oU";
  const player = "#ytd-player";
  const videomark = "#__videomark_ui";
  await page.goto(demoVideo);
  await page.waitFor(player);
  await page.bringToFront();
  await page.click(player);
  await page.waitFor(videomark, { timeout: 2e3 });
});
