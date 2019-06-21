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
  await page.goto(demoVideo);
  await (async selector => {
    await page.waitFor(selector);
    await page.click(selector);
  })('button[aria-label="再生"]');
  await new Promise(resolve => setTimeout(resolve, 1000));
  expect(await page.$("#__videomark_ui")).not.toBe(null);
}, 10e3);
