# pnpm 简介

官网介绍：速度快、节省磁盘空间的软件包管理器

<img src="picture/pnpm/image-20220814084525197.png" alt="image-20220814084525197" style="zoom: 50%;" />

<img src="picture/pnpm/image-20220814084703214.png" alt="image-20220814084703214" style="zoom:50%;" />

# 包管理器简史

## npm@3 之前

node_modules 结构是非常有序的

假设有如下的依赖项：

```
.
├── package-a
│   └── lodash
├── package-b
│   └── lodash
├── package-c
│   └── lodash
└── package-d
    └── lodash
```

node_modules 结构如下：

```
node_modules
├── package-a
│   └── node_modules
│       └── lodash
├── package-b
│   └── node_modules
│       └── lodash
├── package-c
│   └── node_modules
│       └── lodash
└── package-d
    └── node_modules
        └── lodash
```

上面结构有 2 个严重的问题：

1. 会创建过深的依赖树
2. 依赖包可能会被重复安装

## npm@3+ & yarn

为了解决上面的问题，扁平化 node_modules

假设有如下的依赖项：

```
.
├── package-a
│   └── lodash
├── package-b
│   └── lodash
├── package-c
│   └── lodash
└── package-d
    └── lodash
```

在 npm@3+ 和 yarn 中，node_modules 结构变成：

```
node_modules
├── package-a
├── package-b
├── package-c
├── package-d
├── lodash
```

一定程度上简化了依赖树的结构、减少了 node_modules 的体积

> #### 仍存在的问题：

假设存在依赖项：

```
.
├── package-a
│   └── lodash@4.0.0
├── package-b
│   └── lodash@4.0.0
├── package-c
│   └── lodash@3.0.0
└── package-d
    └── lodash@3.0.0
```

node_modules 结构变成：

```
node_modules
├── package-a
├── package-b
├── package-c
│   └── node_modules
│       └── lodash
└── package-d
│   └── node_modules
│       └── lodash
├── lodash
```

![image-20220813135521385](picture/pnpm/image-20220813135521385.png)

> #### 新问题：幽灵依赖

假设有如下的依赖项：

```
.
├── package-a
├── package-b
├── package-c
└── package-d
    └── lodash
```

在 npm@3+ 和 yarn 中，node_modules 结构变成：

```
node_modules
├── package-a
├── package-b
├── package-c
├── package-d
├── lodash
```

因为使用的是扁平化的 node_modules 结构，使开发者有机会使用未在 package.json 中明确声明的依赖包。

> 比方说，我下载 express，那 express 所依赖的包，都会下载到与  express 同一层级的目录下。
> 假设，我现在要使用 express 所依赖的包中的 body-parser，我不需要再 npm i body-parser，便可直接使用。
>
> 这会出现一个问题，项目的 package.json 中没有设置 body-parser 的依赖。
>
> 如果某一天，express 升级了，不依赖 body-parser 了，但项目中还用到 body-parser，此时项目就会报错；
> 或者说依赖的 body-parser 的版本升级了，但项目中用到的还是旧版本的 API，项目也会报错。

# pnpm

对于未被完全解决的：1、创建过深的依赖树； 2、依赖包可能会被重复安装； 3、幽灵依赖
pnpm 使用 [软链接] + [硬链接] 实现 [内容寻址存储 CAS] 解决了上述问题

## 硬链接 & 软链接

在 Linux 的文件系统中，保存在磁盘分区中的文件 都有一个编号，称为 索引节点号 (Inode Index)

- **硬链接**与源文件指向同一个物理地址，具有相同的 inode
  硬连接的作用：允许一个文件拥有多个有效路径名，这样用户就可以给重要文件建立硬链接，以防 “误删”
  就是说，只删除一个链接并不影响源文件和其它的链接，只有最后一个链接被删除后，文件的数据块才会被释放
- **软链接**相当于一个快捷方式
  在软链接中，文件实际上是一个文本文件，文件内容是另一个文件的位置信息

linux 在线编辑器：[Linux - Virtual x86 (copy.sh)](https://copy.sh/v86/?profile=linux26)

```sh
root@superman:~/link_test# vi link
root@superman:~/link_test# cat link
superman
root@superman:~/link_test# ln link link-hard
root@superman:~/link_test# ln -s link link-soft
root@superman:~/link_test# ls -li
total 8
1443783 -rw-r--r-- 2 root root 9 Aug 13 12:01 link
1443783 -rw-r--r-- 2 root root 9 Aug 13 12:01 link-hard
1443782 lrwxrwxrwx 1 root root 4 Aug 13 12:02 link-soft -> link
root@superman:~/link_test# cat link-hard 
superman
root@superman:~/link_test# cat link-soft 
superman


root@superman:~/link_test# vi link
root@superman:~/link_test# cat link
superman monster
root@superman:~/link_test# cat link-hard 
superman monster
root@superman:~/link_test# cat link-soft 
superman monster


root@superman:~/link_test# rm link
root@superman:~/link_test# ls -li
total 4
1443783 -rw-r--r-- 1 root root 17 Aug 13 12:02 link-hard
1443782 lrwxrwxrwx 1 root root  4 Aug 13 12:02 link-soft -> link
root@superman:~/link_test# cat link-hard
superman monster
root@superman:~/link_test# cat link-soft
cat: link-soft: No such file or directory
```

## 内容寻址存储 CAS

pnpm 使用的依赖管理策略：**内容寻址存储**
会把包下载到一个公共目录 store，每个版本只会在系统中安装一次
如果依赖存在于 store 目录中了话，则直接从 store 目录中创建硬链接；如果依赖不存在 store 目录中，再去下载

假设存在依赖项：

```
.
├── package-a
│   └── lodash@4.0.0
├── package-b
│   └── lodash@4.0.0
├── package-c
│   └── lodash@3.0.0
└── package-d
    └── lodash@3.0.0
```

使用 pnpm 下载，所有的依赖包会平铺在 node_module/.pnpm 目录下，不同的是，依赖包会带上版本号；
然后，pnpm 会在 node_modules 目录下创建一级依赖包的软链接

```
node_modules
├── .pnpm
│   └── package-a
│   └── package-b
│   └── package-c
│   └── package-d
│   └── lodash@3.0.0
│   └── lodash@4.0.0
├── package-a  (↑)
├── package-b  (↑)
├── package-c  (↑)
├── package-d  (↑)
```

注意：此时 .pnpm 的结构不是扁平化的

```
node_modules
├── .pnpm
│   └── package-a
│   │   └── node_modules
│   │       └── lodash  (↑)-@4.0.0
│   └── package-b
│   │   └── node_modules
│   │       └── lodash  (↑)-@4.0.0
│   └── package-c
│   │   └── node_modules
│   │       └── lodash  (↑)-@3.0.0
│   └── package-d
│   │   └── node_modules
│   │       └── lodash  (↑)-@3.0.0
│   └── lodash@3.0.0
│   └── lodash@4.0.0
├── package-a  (↑)
├── package-b  (↑)
├── package-c  (↑)
├── package-d  (↑)
```

- 如此，便解决了 [部分依赖重复安装、依赖树结构过深] 的问题（如果一个项目占用 100 MB，那使用 pnpm 可能只占 80 MB）
- 而且，因为只有 package.json 中配置了的依赖包才会在 node_modules 中创建软链接，也解决了幽灵依赖的问题
- 此外，因为他的依赖包都是全局 store 的硬链接，能大大节省磁盘空间（如果一个项目占用 100 MB，传统方式十个项目占用 1000 MB，那么使用 pnpm 可能只占 300 MB）

## 管理 Node.js 版本

> #### 配置 .npmrc

在 `.npmrc` 文件中配置 `use-node-version`：指定项目运行时应用的 Node 版本，支持 semver 版本设置规范
设置后， pnpm 将自动安装指定版本的 Node 并将其用于执行 `pnpm run` / `pnpm node` 命令

```
use-node-version=^16.x
```

> #### `pnpm env`

安装 Node 的 LTS 版本 (稳定版) ：

```text
pnpm env use -g lts
```

安装指定版本：

```text
pnpm env use -g 16
```

- ERROR  Unable to find the global bin directory：需要先执行 `pnpm setup`
- PERM: operation not permitted, symlink XXX：需要以管理员身份执行 `pnpm env use --global lts`
  - 执行之后会给到一个路径，用于设置环境变量
  - 将想用的 node 版本放到 PATH 靠前的位置即可

# 应用到实际

> #### npm 、yarn → pnpm

`import` 命令支持从其它格式的 lock 文件生成 `pnpm-lock.yaml` 文件，目前支持：

1. `package-lock.json`
2. `npm-shrinkwrap.json`
3. `yarn.lock` (v6.14.0 起)

<img src="picture/pnpm/image-20220814085731924.png" alt="image-20220814085731924" style="zoom:67%;" />

> #### 规范包管理工具的使用

项目中使用 `pnpm` 时，如果你不希望项目内其他人使用 `npm i` 或 `yarn`这类包管理器，可以在 `package.json` 配置文件中添加预安装 `preinstall` 配置项，从而规范使用统一的包管理器

```json
{
    "scripts": {
        "preinstall": "npx only-allow pnpm"
    }
}
```

> #### 维护 pnpm

如果安装了很多不同的依赖，那么 store 目录会越来越大

`pnpm store prune` ：用于删除一些不被全局项目所引用到的依赖

> #### 扁平化处理：shamefully-hoist
>

1. 在 .npmrc 中配置 `shamefully-hoist`：使依赖及其子依赖都平铺到 node_modules 目录下

```js
shamefully-hoist=true
```

2. 使用 `pnpm install --shamefully-hoist`，创建一个扁平化的 node_modules 目录结构

> #### 其他短板：

1. 由于 pnpm 创建的 node_modules 依赖软链接，在不支持软链接的环境中 无法使用 pnpm，比如 Electron 应用
2. 因为依赖源文件是安装在 store 中，调试依赖或 patch-package 给依赖打补丁也不太方便，可能会影响其他项目
3. 相对于 npm、yarn，pnpm 的社区相对没那么活跃

# 基础用法

> #### 安装

1. `npm install -g pnpm`
2. `pnpm -v`

> #### 配置

1. `pnpm config set store-dir <path>/.pnpm-store`

   注意：项目应该与 store 在同一个磁盘上，否则 pnpm 会将依赖包复制到项目中，而不是使用硬链接
   这是因为硬链接不能跨磁盘使用

   如果未配置任何存储，则 pnpm 将在同一硬盘上自动创建一个存储
   项目仍然会保持 pnpm 的优势，但是每个驱动器可能有多余的包

- 在安装依赖项时，pnpm 与 npm 使用相同的配置。如果你为 npm 配置了一个私有的软件包注册表， pnpm 也能够获得授权请求，并且无需任何额外的配置

> #### 常用命令

1. `pnpm install` / `pnpm i`

2.  `pnpm install XXX` / `pnpm i XXX` / `pnpm add XXX`

    `pnpm add -D XXX`

    `pnpm add -O XXX`

    `pnpm add -g XXX`

3. `pnpm uninstall` / `pnpm rm` / `pnpm un`

4. `pnpm run XXX` / `pnpm XXX`

> #### 其他命令

1. `pnpm init`

2. `pnpm list` / `pnpm ls`

3. `pnpm update` / `pnpm up`

4. `pnpm prune`：删除不需要的软件包

5. `pnpm config get registry`

   `pnpm config set registry XXX`

6. `pnpm setup`

   1. 为 pnpm CLI 创建一个主目录
   2. 通过更新 shell 配置文件，将 pnpm 主目录添加到 PATH 中
   3. 将 PNPM 可执行文件拷贝到 PNPM 主目录中



- [【总结】1409- 深入浅出 npm & yarn & pnpm 包管理机制 (qq.com)](https://mp.weixin.qq.com/s/5YJYxvcqZIifQIsTR_I3fA)
- [工程化(23): node_modules 相关之pnpm解决了什么问题 (qq.com)](https://mp.weixin.qq.com/s/OCFE6zym6-DG4aDh1ghTqQ)
- [从npm切换到pnpm小记 (qq.com)](https://mp.weixin.qq.com/s/nQeB8jmqyuGlhd3VcNhy9A)
- [最高性能的包管理器-pnpm (qq.com)](https://mp.weixin.qq.com/s/ABnLJlDpxRQSbiHaA-yTDg)
- [2022年了，你还没用pnpm吗？ - 掘金 (juejin.cn)](https://juejin.cn/post/7121386382936768542)
- [pnpm 是凭什么对 npm 和 yarn 降维打击的 - 掘金 (juejin.cn)](https://juejin.cn/post/7127295203177676837)
- [都2022年了，pnpm快到碗里来！ - 掘金 (juejin.cn)](https://juejin.cn/post/7053340250210795557)

