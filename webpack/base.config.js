/*eslint no-var: 0*/

var path = require('path')
var webpack = require('webpack')
var autoprefixer = require('autoprefixer')

module.exports = {
  entry: {
    app: './client/app.js',
    pages: './client/pages.js',
    calculators: './client/calculators.js',
    blog: './client/blog.js',
  },

  output: {
    path: path.join(__dirname, '..', 'static', 'dist'),
    publicPath: '/static/dist/',
    filename: '[name].js',
    sourceMapFilename: '[name].map.js',
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
      { test: /\.json$/, loader: 'json' },
      { test: /\.(eot|svg|ttf|woff|woff2|png|jpg)(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
      { test: require.resolve('react'), loader: 'expose?React' },

      // Ensure CSS shit is the last two loaders for prod override
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.scss$/,
        loader: 'style!css?localIdentName=[name]_[hash:base64:5]!postcss!sass' },
    ],
  },

  postcss: [autoprefixer],

  plugins: [
    new webpack.ProvidePlugin({
      'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch',
      'promise': 'imports?this=>global!exports?global.promise!promise',
    }),
  ],

  resolve: {
    extensions: ['', '.js', '.jsx', '.scss', '.css', '.svg'],
    modulesDirectories: ['client', 'node_modules'],
  },

  externals: {
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true,
    'react/addons': true,
    'cheerio': 'window',
  },
}
