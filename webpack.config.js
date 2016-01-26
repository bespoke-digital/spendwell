
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');


const config = {
  entry: './client/index.js',
  output: {
    path: path.join(__dirname, 'static', 'dist'),
    publicPath: '/static/dist/',
    filename: 'client.js',
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel?stage=0' },
      { test: /\.scss$/, loader: ExtractTextPlugin.extract(
        'style',
        'css?localIdentName=[name]_[hash:base64:5]!postcss!sass'
      ) },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css') },
      { test: /\.(eot|svg|ttf|woff|woff2|png|jpg)(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
      { test: require.resolve('react'), loader: 'expose?React' },
    ],
  },

  postcss: [autoprefixer],

  plugins: [
    new ExtractTextPlugin('main.css', { allChunks: true }),
    new webpack.ProvidePlugin({
      'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch',
      'promise': 'imports?this=>global!exports?global.promise!promise',
    }),
    new webpack.DefinePlugin({
      PLAID_PRODUCTION: false,
    }),
  ],

  resolve: {
    extensions: ['', '.js', '.jsx', '.scss', '.css'],
    modulesDirectories: ['client', 'node_modules'],
  },

};

config.devtool = 'sourcemap';
config.debug = true;

// config.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
// config.plugins.push(new webpack.optimize.DedupePlugin());
// config.plugins.push(new webpack.optimize.UglifyJsPlugin());

module.exports = config;
