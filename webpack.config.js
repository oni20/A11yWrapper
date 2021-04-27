const webpack = require("webpack");
const path = require("path");
const devMode = process.env.NODE_ENV !== "production";

//Plugins
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const config = {
	entry: {
		A11yWrapper: [
			"./js/A11yWrapper.js",
			"./scss/A11yWrapper.scss",
		],
		SourcePage: ["./scss/SourcePage.scss"]
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "js/[name].min.js"
	},
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							url: false
						}
					},
					{
						loader: "sass-loader",
						options: {
							sourceMap: true
						}
					}
				]
			},
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
						plugins: ['@babel/plugin-transform-runtime']
					}
				}
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: "css/[name].css",
			ignoreOrder: false // Enable to remove warnings about conflicting order
		})
	],
	optimization: {
		minimizer: [
			new OptimizeCSSAssetsPlugin({
				cssProcessorPluginOptions: {
					preset: [
						"default",
						{
							discardComments: {
								removeAll: true
							}
						}
					]
				}
			}),
			new UglifyJsPlugin({
				test: /\.js(\?.*)?$/i,
				exclude: /\/nodeModules/
			})
		]
	},
	mode: "production",
	devtool: "eval-source-map"
};
module.exports = config;