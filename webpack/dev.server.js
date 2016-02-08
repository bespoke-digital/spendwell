/*eslint no-var: 0*/

var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var config = require('./dev.config');


// Add react-hot-loader to jsx loading config
config.module.loaders[0].loader = 'react-hot!' + config.module.loaders[0].loader;

config.extry = {
  // WebpackDevServer host and port
  devServer: 'webpack-dev-server/client?http://0.0.0.0:3000',
  // "only" prevents reload on syntax errors
  devServerNoErrors: 'webpack/hot/only-dev-server',
  app: './client/app.js',
  pages: './client/pages.js',
};

config.plugins = config.plugins.concat([
  new webpack.HotModuleReplacementPlugin(),
]);

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  proxy: { '*': 'http://localhost:8000' },
}).listen(3000, 'localhost', function(err) {
  if (err) throw err;
  console.log('Listening at https://localhost:3000');
});
