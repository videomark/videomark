const path = require("path");
const pages = Object.fromEntries(
  require("glob")
    .sync("./pages/*.js")
    .map(pageFile => [path.basename(pageFile, ".js"), require(pageFile)])
);
module.exports = { pages };
