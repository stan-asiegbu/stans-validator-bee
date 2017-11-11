module.exports = {
  entry: __dirname + '/index.js',
  target: 'web',
  output: {
    path: __dirname + '/dist',
    filename: 'validate.min.js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
        options: {
          presets: ['es2015']
        }
      }
    ]
  }
}
