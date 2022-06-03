const path = require('path');

module.exports = {
  mode: "development",
  devtool: 'inline-source-map',
  entry: './src/code.js',
  output: {
    filename: 'code.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module:{
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.csv$/i,
        use: ['csv-loader']
      }
    ]
  }
};