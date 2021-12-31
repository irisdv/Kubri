var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const babelOptions = {
    presets: [
      [
        '@babel/preset-env',
        {
            targets: 'last 2 versions, ie 11',
            modules: false,
        },
      ],
      "@babel/preset-react",
      "@babel/preset-typescript",
    ],
  };

module.exports = {
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    },
    devtool: "source-map",
    watchOptions: {
        ignored: /node_modules/,
    },
    module: {
        rules: [{
                test: /\.(js|jsx|tsx|ts)?$/,
                exclude: /node_modules/,
                use: [
                    {
                      loader: 'babel-loader',
                      options: babelOptions,
                    },
                    {
                      loader: 'ts-loader',
                      options: {
                          configFile: path.resolve('./tsconfig.json'),
                      },
                    },
                  ],
            },
            {
                test: /\.html$/,
                use: [
                  {
                    loader: 'html-loader',
                  },
                ],
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    { loader: "css-loader", options: { importLoaders: 1 } },
                    "postcss-loader",
                ],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                    }
                }],
            },
        ]
    },
    devServer: {
        historyApiFallback: true,
        liveReload: true,
        hot: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            filename: './index.html'
        }),
        new Dotenv({
            path: `./.env`
        }),
        new NodePolyfillPlugin()
    ],
    devServer: {
        liveReload: true,
        hot: true,
        historyApiFallback: true,
    },
}