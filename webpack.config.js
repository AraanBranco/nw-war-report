const nodeExternals = require('webpack-node-externals')
const path = require('path')
const babelLoader = require('babel-loader')

module.exports = {
  target: 'node',
  // Generate sourcemaps for proper error messages
  devtool: 'source-map',
  // Since 'aws-sdk' is not compatible with webpack,
  // we exclude all node dependencies
  externals: [nodeExternals({ modulesDir: path.resolve('/node_modules') })],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: __dirname,
        exclude: /node_modules/,
        use: {
          loader: babelLoader,
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    modules: [path.resolve('/src'), 'node_modules']
  }
}
