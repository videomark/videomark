const path = require("path");

module.exports = {
  mode: "development",

  entry: path.join(__dirname, "src/js/App.js"),

  devtool: "source-map",

  output: {
    path: path.join(__dirname, "videomark-extension"),
    filename: "sodium.js"
  }
};
