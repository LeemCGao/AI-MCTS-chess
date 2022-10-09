module.exports = {
    devtool: 'cheap-module-eval-source-map',
    entry:  __dirname + "/src/main.js",//已多次提及的唯一入口文件
    output: {
        path: __dirname + "/dist",//打包后的文件存放的地方
        filename: "MyGo.js"//打包后输出文件的文件名
    }
}