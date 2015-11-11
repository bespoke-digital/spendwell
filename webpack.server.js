
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.config.js');

const server = new WebpackDevServer(webpack(webpackConfig), {
  contentBase: './public',
  headers: { 'Access-Control-Allow-Origin': '*' },
  stats: { colors: true },
  hot: true,
});

server.listen(3030, 'localhost', function() {});
