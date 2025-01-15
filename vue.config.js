const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  publicPath: '/chenzilong0828.github.io/',  // 改回相对路径
  outputDir: 'dist',
  assetsDir: '',
  productionSourceMap: false,
  configureWebpack: {
    output: {
      filename: '[name].[hash].js',
      chunkFilename: '[name].[hash].js'
    }
  }
})
