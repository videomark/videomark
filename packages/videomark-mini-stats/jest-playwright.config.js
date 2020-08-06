module.exports = {
  launchOptions: {
    headless: false,
  },
  contextOptions: {
    acceptDownloads: true,
  },
  serverOptions: {
    command: "yarn dev",
    port: 1234,
  },
};
