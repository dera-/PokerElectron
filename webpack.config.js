var webpack = require('webpack');
module.exports = {
  entry: [
    'babel-polyfill',
    './src/main.js'
  ],
  output: {
    path: __dirname + "/htdocs/js/",
    filename: "main.js"
  },
  devtool: '#source-map',
  resolve: {
    extensions: ['', '.js','json'],
    modulesDirectories: ["node_modules"]
  },
  plugins: [
  //   new webpack.optimize.DedupePlugin(),  // ライブラリ間で依存しているモジュールが重複している場合、二重に読み込まないようにする
  //   new webpack.optimize.AggressiveMergingPlugin(), //ファイルを細かく分析し、まとめられるところはできるだけまとめてコードを圧縮する
  //   new webpack.optimize.UglifyJsPlugin() //jsファイルのminify
    //new webpack.HotModuleReplacementPlugin(),
    //new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"development"',
        'global': {}, // bizarre lodash(?) webpack workaround
        'global.GENTLY': false // superagent client fix
    })
  ],
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel" },
      { test: /\.json$/, exclude: /node_modules/, loader: "json-loader" }
    ]
  },
  target: 'electron',
  node: {
    __dirname: true, // superagent client fix
  },
};
