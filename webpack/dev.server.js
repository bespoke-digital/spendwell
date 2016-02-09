/*eslint no-var: 0*/

var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var config = require('./dev.config');

process.env.NODE_ENV = 'development';

config.entry = {
  hotLoader: 'webpack-dev-server/client?https://dev.spendwell.co',
  app: './client/app.js',
  pages: './client/pages.js',
};

config.plugins = config.plugins.concat([
  new webpack.HotModuleReplacementPlugin(),
]);

var server = new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  proxy: { '*': 'http://localhost:8000' },
  stats: {
    colors: true,
    assets: false,
    children: false,
    chunks: false,
    modules: false,
  },
});

server.listen(3000, 'localhost', function(err) {
  if (err) throw err;
  console.log('Listening on http://localhost:3000');
  console.log('Proxying to http://localhost:8000');
  console.log('https://dev.spendwell.co');
});
