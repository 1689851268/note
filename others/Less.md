Less （Leaner Style Sheets 的缩写） 是一门向后兼容的 CSS 扩展语言

# 编译 Less

> ##### 方法1：使用命令行编译
>

**① 安装：**

```powershell
npm install -g less
```

如果不能运行，就到 node 官网下载 node
安装完成后，输入 `node -v` / `npm -v` 查看版本，以确定是否安装成功

```powershell
node- v
npm -v
```

npm 是 node 管理包的工具，就可以通过 npm 命令安装 less 啦

**② 编译：**

1. 未指定编译路径

```
lessc styles.less
```

2. 指定编译路径

```
lessc styles.less styles.css
```

```
lessc styles.less > styles.css
```

这样，会在编译成功后，生成新的 style.css 文件，编译的结果不会打印到控制台

3. 编译后，将编译结果的 css 文件进行压缩

需要先下载 less-plugin-clean-css 插件

```
npm install less-plugin-clean-css -g
```

使用插件进行压缩

```
lessc --clean-css styles.less styles.min.css
```

- 缺点：每写一次 less，都需要手动编译

> ##### 方法2：使用外部工具编译
>

能帮助我们自动编译，实时刷新

安装考拉 less 客户端编译工具：

- 可以选择是否压缩编译结果 compress
- 可以选择是否监听 less 文件的变化
- 可以自动编译
- 可以生成资源地图 Source Map 文件

> ##### 方法3：使用开发工具编译（基本都是用这个方法）
>

- WebStorm：内置 File Watchers，设置方法：
  文件 → 设置 → 工具 → File Watchers → 添加选择 less → 指定输出目录
- VSCode：下载 **Easy Less** 插件，使用 less 自动编译功能

# 注释

- 多行注释：`/* 注释内容 */`

这种注释是 css 的注释，编译以后，会保留显示在 css 文件中

- 单行注释：`// 注释内容`

这种代码注释，css 并不识别，不会显示在 css 文件中

```less
.height {
    width: 100px;
    height: 100px;
    // less 中的单行注释内容
    /* less 中的
    多行注释内容 */
}
```

```css
.height {
    width: 100px;
    height: 100px;
    /* less 中的
    多行注释内容 */
}
```

# 变量（Variables）

使用 `@` 定义变量：`@变量名: 变量值;`

- **属性值使用变量**

注意：变量值用于设置属性值，要符合 css 属性规范

```less
@width: 10px;
@height: @width + 10px;
@color: #ccc;
@border: 2px solid red;

#header {
    width: @width;
    height: @height;
    color: @color;
    border: @border;
}
```

编译为：

```css
#header {
    width: 10px;
    height: 20px;
    color: #ccc;
    border: 2px solid red;
}
```

1. **在字符串中使用变量，需要用 `{}` 将变量名括住**

```less
@picUrl: './index/pic/1.jpg';

.box {
    background: url('@{picUrl}') no-repeat center / contain;
}
```

编译为：

```css
.box {
    background: url('index/pic/1.jpg') no-repeat center / contain;
}
```

2. **属性名使用变量，也需要使用 `{}` 将变量名括住**

```less
@boxWidth: width;

.box {
    @{boxWidth}: 100px;
}
```

编译为：

```css
.box {
    width: 100px;
}
```

3. **选择器使用变量，也需要使用 `{}` 将变量名括住**

```less
@selector: .wrap;

@{selector} {
    background: pink;
}
```

编译为：

```css
.wrap {
    background: pink;
}
```

# 导入 less 文件

```less
@import './header.less';
```

在一个 less 文件中导入另一个 less 文件，会把两个 less 文件编译成一个 css 文件

```less
// header.less
.wrap {
    background: pink;
}
```

```less
// index.less
@boxWidth: width;

.box {
    @{boxWidth}: 100px;
    height: 100px;
}

@import './header.less';
```

```css
/* index.css */
.box {
    width: 100px;
    height: 100px;
}

.wrap {
    background: pink;
}
```

# less 的作用域

less 中的是块级作用域，每个 `{}` 都是独立的作用域：

- 同一作用域中，后定义的变量会覆盖前面的同名变量
- 不能在变量的作用域外，使用该变量
- 局部作用域中的变量，会覆盖全局作用域中的同名变量

```less
@color: red;

.box {
    @color: blue;
    background: @color; // 最终颜色是 blue 
}
```

- 注意：变量会被预解析。可以先使用，再定义


```less
.box {
    background: @color; // 先使用
}

@color: red; // 再定义
```

# less 中的运算

- 在 less 中，可以直接算出属性值
- 变量也可以参与运算
- 单位：以最左侧操作数的单位为准

```less
.box {
    background: pink;
    height: @boxWidth - 50;
    width: 50px * 3;
}

@boxWidth: 100px;
```

# 嵌套

```less
#box {
    color: black;

    .navigation {
        font-size: 12px;
    }

    .logo {
        width: 300px;
    }
}
```

会编译为：

```css
#box {
    color: black;
}

#box .navigation {
    font-size: 12px;
}

#box .logo {
    width: 300px;
}
```

- 可以使用 **`&`** 表示当前选择器的父级

```less
#box {
    color: black;

    &:after {
        content: " ";
    }

    &>.child {
        width: 10px;
        height: 10px;
    }
}
```

编译为：

```css
#box {
    color: black;
}

#box:after {
    content: " ";
}

#box>.child {
    width: 10px;
    height: 10px;
}
```

# 混入

可以理解为 CSS 中函数

## 定义 & 调用

```less
.boxSizing () {
    width: 100px;
    height: 100px;
}
```

```less
.box {
    .boxSizing();
    background: skyblue;
}
```

调用结果会编译为：

```css
.box {
    width: 100px;
    height: 100px;
    background: skyblue;
}
```

- 注意：先写的 CSS 样式会被后面的同名样式覆盖

```less
.boxSizing () {
    width: 100px;
    height: 100px;
    background: skyblue;
}

.box {
    .boxSizing();
    background: lightcoral; // 最后是 lightcoral 色
}
```

## 参数设置

混入可以传入参数

```less
@color: lightcoral;

.boxSizing (@bgColor, @size) { // 定义有参混入
    width: @size;
    height: @size;
    border: @size * 0.2 solid pink;
    background: @bgColor;
}

.box {
    .boxSizing(@color, 100px); // 传入参数
}
```

- 如果没有参数，调用混入时，可以把 `()` 省略

```less
.wrap() { // 定义的是混入
    width: 100px;
    height: 100px;
    border: 10px solid pink;
    background: lightcoral;
}

.box {
    .wrap; // 调用混入
}
```

此时要和**样式复用**区分开

```less
.wrap { // 没有定义混入
    width: 100px;
    height: 100px;
    border: 10px solid pink;
    background: lightcoral;
}

.box {
    .wrap; // 直接复用样式
}
```

- 可以设置默认参数

```less
.boxSizing (@size, @bgColor: lightcoral) { // 设置了 @bgColor 的默认值
    width: @size;
    height: @size;
    border: @size * 0.2 solid pink;
    background: @bgColor;
}

.box {
    .boxSizing(100px); // 没有传入 @bgColor 参数
}
```

## 嵌套使用

- 混入里面还能写选择器

```less
.wrap() {
    width: 100px;
    height: 100px;
    border: 10px solid pink;
    background: lightcoral;

    span {
        display: block;
        width: 10px;
        height: 10px;
        background: lightcyan;
    }
}

.box {
    .wrap();
}
```

会编译为：

```css
.box {
    width: 100px;
    height: 100px;
    border: 10px solid pink;
    background: lightcoral;
}

.box span {
    display: block;
    width: 10px;
    height: 10px;
    background: lightcyan;
}
```

- 混入里面可以嵌套混入

```less
.style() {
    width: 100px;
    height: 100px;

    .bg1() {
        background: lightcoral;
    }

    .bg2() {
        background: lightcyan;
    }

    .border1() {
        border: 10px solid pink;
    }

    .border2() {
        border: 10px solid skyBlue;
    }
}

.box {
    .style();
    .style .bg2(); // 可以选择需要的样式
    .style .border2();
}
```

编译为：

```css
.box {
    width: 100px;
    height: 100px;
    background: lightcyan;
    border: 10px solid skyBlue;
}
```

## 条件判断

- `when`：满足指定条件后，才会调用该混入

```less
.boxSizing (@size, @bgColor: lightcoral) when (@size < 150px) {
    width: @size;
    height: @size;
    border: @size * 0.2 solid pink;
    background: @bgColor;
}

.box {
    .boxSizing(100px);
}	
```

- `and`：需要满足多个条件时，用 `and` 拼接

```less
.boxSizing (@size, @bgColor: lightcoral) when (@size < 150px) and (@bgColor =skyBlue) {
    width: @size;
    height: @size;
    border: @size * 0.2 solid pink;
    background: @bgColor;
}

.box {
    .boxSizing(100px, skyBlue);
}
```

也可以直接用 `,` 拼接

```less
.boxSizing (@size, @bgColor: lightcoral) when (@size < 150px), (@bgColor =skyBlue) {
    width: @size;
    height: @size;
    border: @size * 0.2 solid pink;
    background: @bgColor;
}

.box {
    .boxSizing(100px, skyBlue);
}
```

- `not`：不满足指定条件时，用 `not` 判断

```less
.boxSizing (@size, @bgColor: lightcoral) when not (@bgColor =skyBlue) and (@size < 150px) {
    width: @size;
    height: @size;
    border: @size * 0.2 solid pink;
    background: @bgColor;
}

.box {
    .boxSizing(100px);
}
```

