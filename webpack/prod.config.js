/*eslint no-var: 0*/

var webpack = require('webpack');
var config = require('./base.config.js');


config.plugins = config.plugins.concat([
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.UglifyJsPlugin(),
]);

module.exports = config;
