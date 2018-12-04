var webpack = require('webpack');

/* fix for https://medium.com/@danbruder/typeerror-require-is-not-a-function-webpack-faunadb-6e785858d23b */
// https://danbruder.com/blog/typeerror-require-is-not-a-function-webpack-faunadb/
module.exports = {
  mode: 'development',
  plugins: [new webpack.DefinePlugin({ 'global.GENTLY': false })],
  node: {
    __dirname: true
  },
  alias: {
    inherits: 'inherits/inherits_browser.js',
    superagent: 'superagent/lib/client',
    emitter: 'component-emitter'
  }
};
