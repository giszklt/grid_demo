const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // devServer: {
  //   host: 'localhost',
  //   port: 8099,
  //   https: false,
  //   hot: false,
  //   proxy: null,
  // },
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = 'grid demo';
      return args;
    })
  }
})
