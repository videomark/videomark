const webpack = require("webpack");
const { merge } = require("webpack-merge");
const path = require("path");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",

  devtool: "source-map", // "inline-source-map" or "source-map"

  plugins: [
    // https://webpack.js.org/plugins/define-plugin/
    new webpack.DefinePlugin({
      // https://dev-sodium.webdino.org/sodium
      // https://soar2.dhcp.acutus.co.jp:7889/sodium
      FLUENT_URL: JSON.stringify("https://dev-sodium.webdino.org/sodium"),

      // https://dev-sodium.webdino.org:8443/api
      // https://soar2.dhcp.acutus.co.jp:9889/api
      SODIUM_SERVER_URL: JSON.stringify(
        "https://dev-sodium.webdino.org:8443/api"
      ),

      PEAK_TIME_LIMIT_URL: JSON.stringify(
        "https://vm.webdino.org/peak-time-limit.json"
      ),

      // server's default request body size x 0.8 (1mb x 0.8 x 1024)
      EVENT_DATA_MAX_SIZE: 819200,

    }),
  ],

  output: {
    path: path.join(__dirname, "dist-dev"),
  },
});
