# 📁 文件结构

```
observer/
├── basicObserver.ts         # 基础抽象观察器类
├── funcObserver/
│   ├── normalObserver.ts    # 基础可见性观察器
│   ├── effectiveObserver.ts # 有效曝光观察器
│   └── lazyObserver.ts      # 懒加载观察器
├── index.ts                 # 统一导出
└── README.md                # 文档说明
```

<br>
<br>

# 🏗️ 类结构详解

## 1. Observer (抽象基类)

基于 IntersectionObserver API 的观察器抽象基类，为所有观察器提供通用功能和结构。

| 类型        | 名称                 | 访问性         | 类型/签名                                                  | 说明                         |
| ----------- | -------------------- | -------------- | ---------------------------------------------------------- | ---------------------------- |
| 🏷️ **属性** | `observer`           | 🛡️ `protected` | `IntersectionObserver \| null`                             | IntersectionObserver 实例    |
| 🏷️ **属性** | `elementsMap`        | 🛡️ `protected` | `Map<Element, T>`                                          | 被观察元素信息映射表         |
| ⚙️ **方法** | `constructor()`      | 🌐 `public`    | `(options?: IntersectionObserverInit)`                     | 构造函数，初始化观察器       |
| 🔒 **方法** | `init()`             | 🔒 `private`   | `(options: IntersectionObserverInit): void`                | 初始化观察器实例             |
| 🔧 **抽象** | `createInfo()`       | 🛡️ `protected` | `(callbacks: Callbacks): T`                                | 创建观察元素信息（子类实现） |
| 🔧 **抽象** | `onVisible()`        | 🛡️ `protected` | `(elementInfo: T, entry: IntersectionObserverEntry): void` | 处理元素可见（子类实现）     |
| 🔧 **抽象** | `onHidden()`         | 🛡️ `protected` | `(elementInfo: T, entry: IntersectionObserverEntry): void` | 处理元素隐藏（子类实现）     |
| ⚙️ **方法** | `cleanup()`          | 🛡️ `protected` | `(elementInfo: T): void`                                   | 清理资源（子类可重写）       |
| ⚙️ **方法** | `observeElement()`   | 🌐 `public`    | `(element: Element, callbacks: Callbacks): void`           | 开始观察元素                 |
| ⚙️ **方法** | `unobserveElement()` | 🌐 `public`    | `(element: Element): void`                                 | 停止观察元素                 |
| ⚙️ **方法** | `disconnectAll()`    | 🌐 `public`    | `(): void`                                                 | 断开所有观察并清理资源       |
| ⚙️ **方法** | `getElements()`      | 🌐 `public`    | `(): Map<Element, T>`                                      | 获取所有观察元素信息         |

<br>

## 2. NormalObserver (基础可见性观察器)

提供简单的元素可见性检测功能，使用默认的 IntersectionObserver 配置。

| 类型        | 名称               | 访问性         | 类型/签名                                                           | 重写状态            | 说明                          |
| ----------- | ------------------ | -------------- | ------------------------------------------------------------------- | ------------------- | ----------------------------- |
| ⚙️ **方法** | `createInfo()`     | 🛡️ `protected` | `(callbacks: Callbacks): NormalInfo`                                | 🔧 **实现抽象方法** | 创建基础观察元素信息          |
| ⚙️ **方法** | `onVisible()`      | 🛡️ `protected` | `(elementInfo: NormalInfo, entry: IntersectionObserverEntry): void` | 🔧 **实现抽象方法** | 元素可见时触发 onExposure     |
| ⚙️ **方法** | `onHidden()`       | 🛡️ `protected` | `(elementInfo: NormalInfo, entry: IntersectionObserverEntry): void` | 🔧 **实现抽象方法** | 元素隐藏时触发 onLoseExposure |
| ⚙️ **方法** | `observeElement()` | 🌐 `public`    | `(element: Element, callbacks: NormalCallbacks): void`              | 🔄 **重写**         | 类型安全的观察方法            |

**便捷函数：**

- `observe(element, callbacks)` - 观察元素可见性
- `unobserve(element)` - 停止观察元素
- `disconnect()` - 断开所有观察
- `getElements()` - 获取所有观察元素信息

<br>

## 3. EffectiveObserver (有效曝光观察器)

基于时间和可见比例要求的有效曝光检测，元素需要达到指定可见比例（67%）且持续一定时间（500ms）才触发有效曝光。

| 类型        | 名称               | 访问性         | 类型/签名                                                              | 重写状态            | 说明                                   |
| ----------- | ------------------ | -------------- | ---------------------------------------------------------------------- | ------------------- | -------------------------------------- |
| ⚙️ **方法** | `constructor()`    | 🌐 `public`    | `()`                                                                   | 🔄 **重写**         | 使用阈值配置初始化观察器               |
| ⚙️ **方法** | `createInfo()`     | 🛡️ `protected` | `(callbacks: Callbacks): EffectiveInfo`                                | 🔧 **实现抽象方法** | 创建包含定时器的观察信息               |
| ⚙️ **方法** | `onVisible()`      | 🛡️ `protected` | `(elementInfo: EffectiveInfo, entry: IntersectionObserverEntry): void` | 🔧 **实现抽象方法** | 启动定时器，达到时间阈值后触发有效曝光 |
| ⚙️ **方法** | `onHidden()`       | 🛡️ `protected` | `(elementInfo: EffectiveInfo, entry: IntersectionObserverEntry): void` | 🔧 **实现抽象方法** | 清理定时器或触发失去曝光回调           |
| ⚙️ **方法** | `cleanup()`        | 🛡️ `protected` | `(elementInfo: EffectiveInfo): void`                                   | 🔄 **重写**         | 清理定时器资源                         |
| ⚙️ **方法** | `observeElement()` | 🌐 `public`    | `(element: Element, callbacks: EffectiveCallbacks): void`              | 🔄 **重写**         | 类型安全的观察方法                     |

**模块常量：**

- `MIN_DURATION = 500` - 有效曝光最小持续时间（毫秒）
- `THRESHOLD = 0.67` - 有效曝光可见比例阈值

**便捷函数：**

- `observe(element, callbacks)` - 观察元素有效曝光
- `unobserve(element)` - 停止观察元素
- `disconnect()` - 断开所有观察
- `getElements()` - 获取所有观察元素信息

<br>

## 4. LazyObserver (懒加载观察器)

使用 `rootMargin` 扩展检测区域的懒加载观察器，适用于图片懒加载等场景。

| 类型        | 名称               | 访问性         | 类型/签名                                                         | 重写状态            | 说明                       |
| ----------- | ------------------ | -------------- | ----------------------------------------------------------------- | ------------------- | -------------------------- |
| ⚙️ **方法** | `constructor()`    | 🌐 `public`    | `()`                                                              | 🔄 **重写**         | 使用 rootMargin 配置初始化 |
| ⚙️ **方法** | `createInfo()`     | 🛡️ `protected` | `(callbacks: Callbacks): LazyInfo`                                | 🔧 **实现抽象方法** | 创建懒加载观察元素信息     |
| ⚙️ **方法** | `onVisible()`      | 🛡️ `protected` | `(elementInfo: LazyInfo, entry: IntersectionObserverEntry): void` | 🔧 **实现抽象方法** | 元素进入懒加载区域时触发   |
| ⚙️ **方法** | `onHidden()`       | 🛡️ `protected` | `(elementInfo: LazyInfo, entry: IntersectionObserverEntry): void` | 🔧 **实现抽象方法** | 元素离开懒加载区域时触发   |
| ⚙️ **方法** | `observeElement()` | 🌐 `public`    | `(element: Element, callbacks: LazyCallbacks): void`              | 🔄 **重写**         | 类型安全的观察方法         |

**模块常量：**

- `ROOT_MARGIN` - 懒加载偏移量（视窗高度的一半）

**便捷函数：**

- `observe(element, callbacks)` - 观察元素懒加载
- `unobserve(element)` - 停止观察元素
- `disconnect()` - 断开所有观察
- `getElements()` - 获取所有观察元素信息

<br>
