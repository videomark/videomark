const pathname = "/terms.html";
const page = async (browser) => {
  const target = await browser.waitForTarget((target) => {
    try {
      const url = new URL(target.url());
      return url.protocol === "chrome-extension:" && url.pathname === pathname;
    } catch {
      return false;
    }
  });
  return await target.page();
};
module.exports = { pathname, page };
