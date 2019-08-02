const path = require("path");
const pages = {};
require("glob")
  .sync("./pages/*.js")
  .map(pageFile => [path.basename(pageFile, ".js"), require(pageFile)])
  .forEach(([key, value]) => Object.assign(pages, { [key]: value }));
module.exports = { pages };
