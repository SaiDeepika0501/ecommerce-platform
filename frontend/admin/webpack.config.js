const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devServer: {
    port: 3005,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'admin',
      filename: 'remoteEntry.js',
      exposes: {
        './AdminDashboard': './src/AdminDashboard',
        './UserManagement': './src/UserManagement',
        './OrderManagement': './src/OrderManagement',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
}; 