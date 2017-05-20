// webpack.config.js

const path = require('path');

module.exports = {
  entry: './frontend/app/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'frontend/dist')
  }
};