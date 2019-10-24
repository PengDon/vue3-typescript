/**
 * @author: don 
 * @date: 2019-10-14 15:29:24 
 * @last Modified by:   don 
 * @last Modified time: 2019-10-14 15:29:24 
 * @describe: 
 * 
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const package = require('./package.json');

const isProduction = Object.is(process.env.NODE_DEV, 'pro');
const isTest = Object.is(process.env.NODE_DEV, 'test');

console.log(isTest)

// 路径引入的方法
const resolve = (dir) => {
  return path.resolve(__dirname, dir);
}

// 自定义webpack
module.exports = {
  publicPath: './', // 基本的路径  [参考](https://cli.vuejs.org/zh/config/#publicpath)
  outputDir: path.join(__dirname, './weixin', package.name),
  /********************************css的配置 start********************************/
  css: {
    extract: true, // 分离插件
    sourceMap: false, // 开发人员定位问题
    loaderOptions: {
      // 配置引入全局的样式
      less: {
        // data: `@import "@/assets/css/xxx.less";`
      }
    },
    modules: false,
  },
  /********************************css的配置 end********************************/

  configureWebpack: (config) => {
    const env = process.env.NODE_ENV;
    switch (env) {
      case 'development':
        console.log('当前为开发环境');
        break;
      case 'production':
        console.log('当前为生产环境');
        break;
      case 'test':
        console.log('当前为测试环境');
        break;
      default:
        console.error('命令错误，无匹配环境');
        break;
    }
    // 配置插件start
    let plugins = [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        title: 'zzs-web',
        hash: true,
        favicon: './src/assets/logo.png',
        href: path.join('/', package.name, '/'),
        minify: {
          removeAttributeQuotes: false, // 去除双引号(实际开发改为true)
          collapseWhitespace: false, // 合并代码到一行(实际开发改为true)
        },
      }),
    ];
    config.plugins = [...config.plugins, ...plugins];
    // 配置插件end
    if (isProduction) {
      config.plugins.push(
        new UglifyJsPlugin({
          uglifyOptions: {
            compress: {
              drop_debugger: true,
              drop_console: true,
            }
          },
          sourceMap: false,
          // 开启进程构建项目
          parallel: true,
        })
      )
    }
  },
  chainWebpack: (config) => {
    // 配置别名
    config.extensions = ['.js', '.ts', '.vue'];
    config.resolve.alias
      .set('views', resolve('src/views'))
      .set('api', resolve('src/api'))
      .set('utils', resolve('src/utils'));
    // 判断在生产环境做的事情
    if (isProduction) {
      // 删除预加载
      config.plugins.delete('preload');
      config.plugins.delete('prefetch');
      // 压缩代码
      config.optimization.minisize(true);
      // 分割代码
      config.optimization.splitChunks({
        chunks: 'all'
      })
    }
  },
  // 生产环境是否生成soureceMap
  productionSourceMap: false,
  // 启动并发数
  parallel: require('os').cpus().length > 1,
  // 配置开发服务器
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    host:'0.0.0.0',
    port: 80,
    compress: true, // 自动压缩
    open: false, // 自动打开浏览器
    inline: true, // 页面自动刷新
    hot: true, // 热更新,实时更新
    disableHostCheck: true, // 关闭host检查
    proxy:{ // 配置跨域
      '/':{
        target:'http://tappnr.dtds.com.cn',
        changeOrigin: true,
        ws: true,
      }
    }
  },
};
