# webpack 的使用

## 配置 webpack

1. `pnpm init`
2. `tsc --init`
3. `pnpm add webpack webpack-cli typescript ts-loader -D`
4. 在项目的根目录下创建、编写 webpack.config.js 配置文件

```js
const path = require("path"); // 引入内置模块

// webpack 中所有的配置信息都应该写在这个 [导出对象] 中
module.exports = {
    mode: "production", // 设置 webpack 打包的模式
    entry: "./src/index.ts", // 指定入口文件
    /* 打包输出的相关配置 */
    output: {
        path: path.resolve(__dirname, "dist"), // 生成打包文件的目录
        filename: "main.js", // 打包文件的文件名
    },
    /* 指定 webpack 打包时要使用的模块 */
    module: {
        /* 打包规则 */
        rules: [
            {
                test: /\.ts$/, // 指定要打包的文件
                use: "ts-loader", // 指定要使用的 loader
                exclude: /node_modules/, // 要排除的文件(目录)
            },
        ],
    },
};
```

5. 编写 src/index.ts 文件

```ts
/* index.ts */
const num: number = 99;
console.log("num", num);
```

6. 配置 package.json 文件的 `scripts` 字段

```json
    "scripts": {
        "build": "webpack"
    },
```

7. 执行脚本：`pnpm build` - 即可将 src/index.ts 打包到 dist/main.js
8. 编写 src/index.html 文件

```html
<body>
    <script src="../dist/main.js"></script>
</body>
```

打开 inex.html 文件即可查看构建的输出文件的使用情况



## resolve

用于配置引用模块

1. 在 webpack.config.js 中，配置 [导出对象] 的 `resolve` 字段

```js
resolve: { extensions: [".ts", ".js"] }, // 配置省略文件路径的后缀名 ( 注意尽量不要同名，可能会出问题 )
```

此时，JS TS 文件都可以当作模块使用，即可以在以上文件中使用模块代码 (导入导出)；默认情况下，TS 文件中不能使用模块代码

> #### demo

```ts
/* utils.ts */
export const fun = () => {
    console.log("fun");
};
```

```ts
/* index.ts */
import { fun } from "./utils";
fun();
```

执行 `pnpm build` 即可构建代码；默认情况下，TS 文件中不能使用模块代码，执行 `pnpm build` 会报错



# webpack 插件

## webpack-dev-server

用于配置 webpack 的开发服务器；每当代码更新，都能自动重新构建代码

> #### 基本使用

1. 下载插件：`pnpm i webpack-dev-server -D`
2. 在 webpack.config.js 的 [导出对象] 中配置 devServer 字段，设置静态资源路径：`devServer: { static: "./" },`
3. 在 package.json 中配置 script 字段：`"serve": "webpack serve"`
4. 执行脚本 `pnpm serve`

执行完脚本后，即可访问 http://localhost:8080/ 查看热更新的情况啦~ 可以看见，访问的其实就是项目的根目录 ( ∵ `static: "./"` )；
需要注意：**使用 webpack-dev-server 热更新时，为了提高更新的速度，更新后的输出文件不会根据配置文件的 `output.path` 生成，而是直接存储在内存中**。我们可以直接访问 http://localhost:8080/main.js 来读取更新后的文件，就是说，这个更新后的文件其实是存储在项目的根目录下的，只是我们没办法直接看见。

可以发现，配置文件中 `output.path` 字段配置的是 `pnpm build` 后输出文件的设置，与使用热更新构建的输出文件无关；
就是说，删除 dist 文件夹并不会对热更新产生任何影响。

注意：只是 `output.path` 对热更新构建的输出文件无效而已，其他配置项仍然有效！！！

```js
/* utils.ts */
export const fun = () => {
    console.log("fun");
};
```

```js
/* index.ts */
import { fun } from "./utils";
fun();
```

```html
<body>
    <!-- 外联的是热更新生成的输出文件 -->
    <script src="/main.js"></script>
</body>
```

此时即可通过访问 http://localhost:8080/src/ 查看热更新后页面的展示情况啦~
也可以设置脚本 `"open": "webpack serve --open"`，这样 执行 `pnpm open` 后，浏览器就会自动打开 http://localhost:8080/ 啦



## html-webpack-plugin

用于自定制 index.html

1. 下载插件 `pnpm i html-webpack-plugin -D`
2. 导入、配置插件

```js
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 导入插件

const htmlWebpackPlugin = new HtmlWebpackPlugin(); // 创建插件的实例对象

module.exports = {
    mode: "production",
    entry: "./src/index.ts",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: { extensions: [".ts", ".js"] },
    // devServer: { static: "./" }, // 配置 html-webpack-plugin 后，可不写
    plugins: [htmlWebpackPlugin], // 配置插件
};
```

此时执行 `pnpm build` 会在 dist 目录下生成 index.html 文件 **并自动引入需要的资源**，打开此 index.html 即可查看打包后的页面情况啦；
执行 `pnpm open` 能直接查看页面的热更新情况。就是说 除了输出文件 main.js，index.html 也被新建到内存中了

可以看到，生成的 index.html 是通过在 `head` 标签的最后面添加 `<script defer src="main.js"></script>` 引入资源的

> #### 设置 index.html 的 `title` 标签内容

- 可在创建插件实例时传入配置对象设置 index.html 的 `title` 标签内容；默认为 `"Webpack App"`

```js
const htmlWebpackPlugin = new HtmlWebpackPlugin({ title: "自定义title" });
```

> #### 设置模板

1. 创建模板文件 ./src/index.html，在模板文件中不需要引入任何资源，构建时会自动引入

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    我是模板文件
</body>

</html>
```

2. 配置 webpack.config.js 文件，通过 `template` 字段设置：

```js
const htmlWebpackPlugin = new HtmlWebpackPlugin({ template: "./src/index.html" });
```

> #### 设置 index.html 的文件名 & 生成路径

- 配置 webpack.config.js 文件，通过 `filename` 字段设置；默认为 `"./index.html"`，就是说：
  执行脚本 `pnpm build` 会在 dist 目录下生成 index.html
  执行脚本 `pnpm serve` 会在项目根目录的内存中生成 index.html

```js
const htmlWebpackPlugin = new HtmlWebpackPlugin({ filename: "./src/index.html" });
```

此时，执行脚本 `pnpm build` 会在 dist/src 目录下生成 index.html；
执行脚本 `pnpm serve` 会在 /src 目录下生成 index.html



## clean-webpack-plugin

默认情况下，重复执行  `pnpm build`  进行构建 不会删除 `output.path` 目录下的文件；如果有同名的文件，则将其覆盖；
安装该插件后，会先清空 `output.path` 目录下的文件，再存入新生成的文件。

1. 下载插件：`pnpm add clean-webpack-plugin -D`
2. 配置 webpack.config.js 文件：
   ① 引入插件：`const { CleanWebpackPlugin } = require("clean-webpack-plugin");`
   ② 配置插件：配置 [导出对象] 的 plugins 字段 `plugins: [new CleanWebpackPlugin()]`

此时，执行 `pnpm build` 会先把 dist 目录清空，再存入编译后生成的新文件



# babel

用于将高版本的 JS 代码转变成低版本的 JS 代码，以解决浏览器的兼容问题

1. `@babel/core` - babel 的核心工具
2. `@babel/preset-env` - 处理浏览器兼容问题
3. `babel-loader` - babel 和 webpack 的结合工具
4. `core-js` - 模拟 JS 的运行环境

1. `pnpm add @babel/core @babel/preset-env babel-loader core-js -D`
2. 配置 webpack.config.js 文件：修改 [配置对象] 的 `module.rules.use` 字段
   **注意：`use` 字段的配置顺序不能随意更改，因为是从后往前执行的⭐**

```json
/* 要使用的 loader */
use: [
    /* 配置 babel */
    {
        loader: "babel-loader", // 指定加载器
        /* 配置信息 */
        options: {
            /* 预定义环境 */
            presets: [
                [
                    "@babel/preset-env", // 指定环境的插件
                    {
                        targets: { ie: 11 }, // 要兼容的目标浏览器版本
                        corejs: "3", // 指定 core-js 的版本 (可以看一下 package.json 写的什么版本
                        useBuiltIns: "usage", // 使用 core-js 的方式为 [按需加载]
                    },
                ],
            ],
        },
    },
    "ts-loader",
],
```

3. 在 index.ts 中使用一下高级语法

```ts
console.log(Promise);
```

4. 执行 `pnpm build` 重新打包、查看 dist/index.js，会发现生成了一大串代码。因为 babel 用低版本的 JS 代码实现了 Promise

- 但是，IE11 仍不能运行 index.js。因为 webpack 会用箭头函数包裹代码，来嵌套一层作用域、以防变量冲突
此时，需要配置 webpack.config.js 文件：在 [配置对象] 中添加 `output.environment` 字段

```json
environment: { arrowFunction: false } // 不使用箭头函数包裹代码
```

