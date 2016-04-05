/*eslint no-var: 0*/

var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var config = require('./base.config.js');

process.env.NODE_ENV = 'production';


config.module.loaders[config.module.loaders.length - 2] = {
  test: /\.css$/,
  loader: ExtractTextPlugin.extract('style', 'css'),
};

config.module.loaders[config.module.loaders.length - 1] = {
  test: /\.scss$/,
  loader: ExtractTextPlugin.extract('style', 'css?localIdentName=[hash:base64:10]!postcss!sass'),
};

config.plugins = config.plugins.concat([
  new ExtractTextPlugin('[name].css'),
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.DedupePlugin(),
  // new webpack.optimize.UglifyJsPlugin(),
]);

module.exports = config;
