/* eslint @typescript-eslint/no-var-requires: 0 */
const path = require("path");
const nodeExternals = require("webpack-node-externals");
const isProduction = false;

module.exports = {
  entry: "./src/index.ts",
  output: {
    libraryExport: "default",
    libraryTarget: "umd"
  },
  mode: isProduction ? "production" : "development",
  devtool: false,
  stats: "minimal",
  plugins: [],
  externals: nodeExternals(),
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      // Remember to keep in sync with `tsconfig.json`
      "upload-exif-plugin": path.resolve(__dirname, "src")
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "babel-loader" // Options are in 'babel.config.js'
          },
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.build.json"
            }
          }
        ],
        include: [path.resolve(__dirname, "src")]
      }
    ]
  }
};
