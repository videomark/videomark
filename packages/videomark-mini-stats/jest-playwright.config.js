module.exports = {
  launchOptions: {
    headless: false,
  },
  contextOptions: {
    acceptDownloads: true,
  },
  serverOptions: {
    command: "pnpm dev",
    port: 1234,
  },
};
