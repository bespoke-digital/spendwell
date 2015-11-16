
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const webpack = require('webpack');
const autoprefixer = require('autoprefixer');


const config = {
  entry: './src/client.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'client.js',
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
      { test: /\.scss$/, loader: ExtractTextPlugin.extract(
        'style',
        'css?localIdentName=[name]_[local]_[hash:base64:5]!postcss!sass'
      ) },
      { test: require.resolve('react'), loader: 'expose?React' },
      { test: /\.(eot|svg|ttf|woff|woff2)$/, loader: 'file' },
    ],
  },

  postcss: [autoprefixer],

  plugins: [
    new ExtractTextPlugin('main.css', { allChunks: true }),
  ],

  resolve: {
    modulesDirectories: ['src', 'node_modules'],
  },

};

config.devtool = 'sourcemap';
config.debug = true;

// config.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
// config.plugins.push(new webpack.optimize.DedupePlugin());
// config.plugins.push(new webpack.optimize.UglifyJsPlugin());

module.exports = config;
