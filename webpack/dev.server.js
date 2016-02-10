/*eslint no-var: 0*/

const express = require('express');
const webpack = require('webpack');
const proxyMiddleware = require('http-proxy-middleware');

const config = require('./dev.config');

process.env.NODE_ENV = 'development';

config.entry = {
  hotLoader: 'webpack-hot-middleware/client',
  app: './client/app.js',
  pages: './client/pages.js',
};

config.plugins = config.plugins.concat([
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin(),
]);


const app = express();
const compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath,
}));

app.use(require('webpack-hot-middleware')(compiler));

app.use(proxyMiddleware('http://localhost:8000/'));

app.listen(3000, 'localhost', function(err) {
  if (err) throw err;

  console.log('Listening on http://localhost:3000');
  console.log('Proxying to http://localhost:8000');
  console.log('https://dev.spendwell.co');
});

// var WebpackDevServer = require('webpack-dev-server');
// var server = new WebpackDevServer(webpack(config), {
//   publicPath: config.output.publicPath,
//   hot: true,
//   proxy: { '*': 'http://localhost:8000' },
//   stats: {
//     colors: true,
//     assets: false,
//     children: false,
//     chunks: false,
//     modules: false,
//   },
// });

// server.listen(3000, 'localhost', function(err) {
//   if (err) throw err;
//   console.log('Listening on http://localhost:3000');
//   console.log('Proxying to http://localhost:8000');
//   console.log('https://dev.spendwell.co');
// });
