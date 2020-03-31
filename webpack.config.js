const path = require("path");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");

module.exports = {
  entry: "./src/App.js",

  output: {
    path: path.resolve(__dirname, "./", "dist"),
    publicPath: "/",
    filename: "App.js"
  },

  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "svg-url-loader",
            options: {
              limit: 10000
            }
          }
        ]
      },
      // file-loader
      {
        test: /\.(jpg|png|gif)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
            outputPath: "./assets/"
          }
        }
      },

      // scss loaders
      {
        test: /\.(sc|sa|c)ss$/,
        use: [
          "style-loader",
          "css-loader", // allows require of .css files
          "sass-loader" // allows require of .scss files
        ] // order matters, but note last loader is run first :-)
      }
    ]
  },

  resolve: {
    extensions: ["*", ".js", ".jsx"]
  },

  plugins: [new CleanWebpackPlugin()]
};
