const path = require("path");

// ref: https://webpack.js.org/guides/production/

module.exports = {
  entry: path.join(__dirname, "src/js/App.js"),

  output: {
    path: path.join(__dirname, "dist"),
    filename: "sodium.js"
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader"
      }
    ]
  }
};
