const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",

  devtool: "source-map", // "inline-source-map" or "source-map"

  plugins: [
    // https://webpack.js.org/plugins/define-plugin/
    new webpack.DefinePlugin({
      FLUENT_URL: JSON.stringify("https://sodium.webdino.org/sodium"),
      SODIUM_SERVER_URL: JSON.stringify("https://sodium.webdino.org:8443/api")
    })
  ]
});
