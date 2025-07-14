const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  mode: 'development',
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
    liveReload: true,
    allowedHosts: 'all',
    host: '0.0.0.0',
    open: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: true,
      },
      logging: 'error',
      webSocketTransport: 'ws'
    },
    setupExitSignals: false,
    devMiddleware: {
      writeToDisk: false,
    },
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        products: 'products@http://localhost:3001/remoteEntry.js',
        cart: 'cart@http://localhost:3002/remoteEntry.js',
        users: 'users@http://localhost:3003/remoteEntry.js',
        admin: 'admin@http://localhost:3004/remoteEntry.js',
        orders: 'orders@http://localhost:3005/remoteEntry.js',
      },
      shared: {
        react: { 
          singleton: true, 
          requiredVersion: '^18.2.0',
          strictVersion: false
        },
        'react-dom': { 
          singleton: true, 
          requiredVersion: '^18.2.0',
          strictVersion: false
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.3.0',
          strictVersion: false
        },
        axios: {
          singleton: true,
          requiredVersion: '^1.4.0',
          strictVersion: false
        },
      }
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      },
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
}; 