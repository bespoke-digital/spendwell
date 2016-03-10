/*eslint no-var: 0*/

process.env.NODE_ENV = 'development';

const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');

const config = require('./dev.config');


config.entry.app = [
  config.entry.app,
  'webpack-dev-server/client?https://dev.spendwell.co/',
  'webpack/hot/dev-server',
];

config.plugins = config.plugins.concat([
  new webpack.HotModuleReplacementPlugin(),
]);

var compiler = webpack(config);
var server = new webpackDevServer(compiler, {
  hot: true,
  noInfo: true,
  port: 3000,
  publicPath: config.output.publicPath,
  proxy: {
    '*': {
      target: 'http://localhost:8000',
      secure: false,
    },
  },
});

server.listen(3000, ()=> console.log('ready'));
