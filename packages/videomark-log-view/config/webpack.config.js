const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const SriPlugin = require("webpack-subresource-integrity");
const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");
const isEnvProduction = process.env.NODE_ENV === "production";
const isAndroid = isEnvProduction && !process.env.PUBLIC_URL;
const chunkhash = isAndroid ? "" : ".[chunkhash:8]";
const mediahash = isAndroid ? "" : ".[hash:8]";
const contenthash = isAndroid ? "" : ".[contenthash:8]";
const urlLoaderOptions = isAndroid
  ? {}
  : { name: `static/media/[name]${mediahash}.[ext]`, limit: 10000 };

module.exports = {
  mode: isEnvProduction ? "production" : "development",
  bail: isEnvProduction,
  entry: path.resolve("src/index.jsx"),
  output: {
    path: path.resolve("build"),
    filename: `static/js/[name]${isEnvProduction ? chunkhash : ""}.js`,
    chunkFilename: `static/js/[name]${chunkhash}.chunk.js`,
    crossOriginLoading: "use-credentials",
  },
  optimization: {
    minimize: isEnvProduction,
    minimizer: [new TerserPlugin(), new OptimizeCSSAssetsPlugin()],
    splitChunks: {
      chunks: "all",
      name: false,
    },
    runtimeChunk: !isAndroid,
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  performance: {
    hints: false,
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.(bmp|gif|jpe?g$|png)$/,
            loader: "url-loader",
            options: urlLoaderOptions,
          },
          {
            test: /\.jsx?$/,
            include: path.resolve("src"),
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              cacheCompression: false,
            },
          },
          {
            test: /\.svg$/,
            use: [
              "@svgr/webpack",
              {
                loader: "file-loader",
                options: {
                  name: `static/media/[name]${mediahash}.[ext]`,
                },
              },
            ],
          },
          {
            test: /\.css$/,
            sideEffects: true,
            use: [
              isEnvProduction ? MiniCssExtractPlugin.loader : "style-loader",
              {
                loader: "css-loader",
                options: {
                  modules: {
                    getLocalIdent: getCSSModuleLocalIdent,
                  },
                  importLoaders: 1,
                },
              },
              {
                loader: "postcss-loader",
                options: {
                  postcssOptions: { plugins: ["postcss-preset-env"] },
                },
              },
            ],
          },
        ],
      },
    ],
  },
  plugins: [
    new SriPlugin({
      hashFuncNames: ["sha256", "sha384"],
      enabled: isEnvProduction,
    }),
    new HtmlWebpackPlugin({
      template: path.resolve("public/index.html"),
      minify: isEnvProduction,
    }),
    new webpack.EnvironmentPlugin(["NODE_ENV", "BASE_URL"]),
    !isEnvProduction && new webpack.HotModuleReplacementPlugin(),
    isEnvProduction &&
      new MiniCssExtractPlugin({
        filename: `static/css/[name]${contenthash}.css`,
        chunkFilename: `static/css/[name]${contenthash}.chunk.css`,
      }),
    isAndroid &&
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
  ].filter(Boolean),
};
