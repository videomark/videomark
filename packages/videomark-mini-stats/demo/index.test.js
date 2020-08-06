beforeAll(async () => {
  await page.goto("http://localhost:1234");
});
afterEach(async () => {
  await page.screenshot({
    path: `screenshots/${Date.now()}.png`,
  });
});
test("「Share or Download」ボタンを押すとPNG画像がダウンロードされる", async () => {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.click(`input[type="button"][value="Share or Download"]`),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.png$/);
});
