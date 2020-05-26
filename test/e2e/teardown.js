const { spawnSync } = require("child_process");

module.exports = async () => {
  await global.__BROWSER__.close();
  spawnSync("rm", ["-rf", "--", global.__VIDEOMARK_EXTENSION_PATH__]);
};
