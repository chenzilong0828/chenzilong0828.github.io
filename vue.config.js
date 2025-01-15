const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(false),
      }),
    ],
  },
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => ({
        ...options,
        compilerOptions: {
          ...options.compilerOptions,
          isCustomElement: tag => tag === 'ResizeObserver'
        }
      }));
  },
  devServer: {
    onBeforeSetupMiddleware(devServer) {
      devServer.app.use((req, res, next) => {
        const originalConsoleError = console.error;
        console.error = (...args) => {
          if (args[0] && args[0].includes('ResizeObserver')) return;
          originalConsoleError.apply(console, args);
        };
        next();
      });
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: (error) => {
          if (error.message.includes('ResizeObserver')) {
            return false;
          }
          return true;
        },
      },
    },
  }
}
