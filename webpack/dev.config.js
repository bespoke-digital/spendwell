/*eslint no-var: 0*/

var config = require('./base.config.js');


// config.module.loaders.concat([
//   {
//     test: /\.scss$/,
//     loader: ['style', 'css?localIdentName=[name]_[hash:base64:5]!postcss!sass'],
//   },
//   {
//     test: /\.css$/,
//     loader: ['style', 'css'],
//   },
// ]);

// config.devtool = 'sourcemap';
// config.devtool = 'cheap-module-eval-source-map';
config.debug = true;

module.exports = config;
