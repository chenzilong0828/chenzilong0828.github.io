const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  publicPath: './',  // 改为相对路径，这是关键
  outputDir: 'dist',
  assetsDir: '',
  productionSourceMap: false,
  configureWebpack: {
    output: {
      filename: 'js/[name].[hash].js',
      chunkFilename: 'js/[name].[hash].js'
    }
  },
  // 添加开发服务器配置
  devServer: {
    proxy: {
      '/intelligent-device-manage': {
        target: 'http://192.168.9.139:8080',
        changeOrigin: true,
        // pathRewrite: {
        //   '^/intelligent-device-manage': ''
        // }
      },
      '/intelligent-device-mock': {
        target: 'http://192.168.9.139:8080',
        changeOrigin: true,
        // pathRewrite: {
        //   '^/intelligent-device-manage': ''
        // }
      },
      '/intelligent-device': {
        target: 'http://192.168.9.139:8080',
        changeOrigin: true,
        // pathRewrite: {
        //   '^/intelligent-device-manage': ''
        // }
      },
      '/api': {
        target: 'http://192.168.9.139:8080',
        changeOrigin: true,
        // pathRewrite: {
        //   '^/api': ''
        // }
      }
    }
  }
})
