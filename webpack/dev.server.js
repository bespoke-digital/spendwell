/*eslint no-var: 0*/

var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var config = require('./dev.config');


// Add react-hot-loader to jsx loading config
config.module.loaders[0].loader = 'react-hot!' + config.module.loaders[0].loader;

config.entry = {
  hotLoader: 'webpack-dev-server/client?https://dev.spendwell.co',
  app: ['./client/app.js', 'webpack/hot/dev-server'],
  pages: ['./client/pages.js', 'webpack/hot/dev-server'],
};

config.plugins = config.plugins.concat([
  new webpack.HotModuleReplacementPlugin(),
]);

var server = new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  proxy: { '*': 'http://localhost:8000' },
  stats: { colors: true },
});

server.listen(3000, 'localhost', function(err) {
  if (err) throw err;
  console.log('Listening on http://localhost:3000');
  console.log('Proxying to http://localhost:8000');
  console.log('https://dev.spendwell.co');
});
