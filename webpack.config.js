var webpack = require('webpack');


var BASEDIR = "./app";
var bower_dir = __dirname + '/app/bower_components';

var config = {
  addVendor: function (name, path) {
    this.resolve.alias[name] = path;
    this.module.noParse.push(new RegExp(path));
  },
  devtool: 'eval',
  entry: {
    app: ['./app/scripts/react/index.js'],
    vendors: ['react']
  },
  output: {
    path: __dirname +'app/scripts/react/',
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    alias: {
    },
    extensions: ['', '.js']
  },
  module: {
    noParse: [],
    loaders: [
      { test: /\.js$/, loaders: ['react-hot', 'jsx?harmony'], exclude: /node_modules/ },
    ]
  }
};

config.addVendor('react', bower_dir + '/react/react.min.js');

module.exports = config;