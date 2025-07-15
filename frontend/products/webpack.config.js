const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  mode: 'development',
  devServer: {
    port: 3001,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'products',
      filename: 'remoteEntry.js',
      exposes: {
        './Products': './src/Products',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        axios: {
          singleton: true,
          requiredVersion: '^1.4.0',
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react'],
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
}; 