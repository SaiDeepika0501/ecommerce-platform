const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  mode: 'development',
  devServer: {
    port: 3004,
    hot: true,
    liveReload: true,
    allowedHosts: 'all',
    host: '0.0.0.0',
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
    },
    setupExitSignals: false,
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
      name: 'admin',
      filename: 'remoteEntry.js',
      exposes: {
        './AdminDashboard': './src/AdminDashboard',
      },
      shared: {
        react: { 
          singleton: true, 
          requiredVersion: '^18.2.0',
          eager: true,
          strictVersion: false
        },
        'react-dom': { 
          singleton: true, 
          requiredVersion: '^18.2.0',
          eager: true,
          strictVersion: false
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.3.0',
          eager: true,
          strictVersion: false
        },
        axios: {
          singleton: true,
          requiredVersion: '^1.4.0',
          eager: true,
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