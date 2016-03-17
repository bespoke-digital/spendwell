/*eslint no-var: 0*/

var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');


module.exports = {
  entry: {
    app: './client/app.js',
    pages: './client/pages.js',
  },

  output: {
    path: path.join(__dirname, '..', 'static', 'dist'),
    publicPath: '/static/dist/',
    filename: '[name].js',
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
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
    new ExtractTextPlugin('[name].css'),
    new webpack.ProvidePlugin({
      'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch',
      'promise': 'imports?this=>global!exports?global.promise!promise',
    }),
  ],

  resolve: {
    extensions: ['', '.js', '.jsx', '.scss', '.css'],
    modulesDirectories: ['client', 'node_modules'],
  },
};
