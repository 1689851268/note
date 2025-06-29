# 组件说明

一个图片组件，支持加载状态、错误处理和多种显示模式。

<br><br>

# 特性

- 🚀 **懒加载**: 可选的图片懒加载，优化页面加载性能
- ⚡ **骨架屏**: 加载时显示带扫光动效的骨架屏
- 🔄 **错误处理**: 三种错误处理模式（占位符、骨架屏、隐藏）
- 🎨 **填充模式**: 支持多种 object-fit 模式
- 📢 **事件通知**: 加载成功/失败时触发相应事件

<br><br>

# Props

| 参数           | 类型                                                       | 默认值          | 说明              |
| -------------- | ---------------------------------------------------------- | --------------- | ----------------- |
| `src`          | `string`                                                   | -               | 图片源地址 (必传) |
| `objectFit`    | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'cover'`       | 图片填充方式      |
| `alt`          | `string`                                                   | `''`            | 图片描述          |
| `errorDisplay` | `'skeleton' \| 'hide' \| 'placeholder'`                    | `'placeholder'` | 错误时的展示方式  |
| `lazy`         | `boolean`                                                  | `false`         | 是否启用懒加载    |

<br><br>

# Events

| 事件名         | 参数                        | 说明                           |
| -------------- | --------------------------- | ------------------------------ |
| `on-loaded`    | `Event`                     | 图片加载成功时触发             |
| `on-error`     | `Event`                     | 图片加载失败时触发             |
| `on-lazy-load` | `IntersectionObserverEntry` | 启用懒加载时，进入加载区域触发 |

<br><br>

# 错误处理模式

- **placeholder**: 显示错误占位符（默认）
- **skeleton**: 保持显示骨架屏
- **hide**: 隐藏整个组件

<br><br>

# 使用示例

```vue
<template>
    <!-- 基础用法 -->
    <Image
        src="https://example.com/image.jpg"
        style="width: 300px; height: 200px"
        @on-loaded="onLoad"
        @on-error="onError"
    />

    <!-- 自定义填充方式 -->
    <Image
        src="https://example.com/image.jpg"
        style="width: 200px; height: 200px"
        object-fit="contain"
    />

    <!-- 错误处理 -->
    <Image
        src="https://invalid-url.com/image.jpg"
        style="width: 200px; height: 150px"
        error-display="skeleton"
    />

    <!-- 懒加载 -->
    <Image
        src="https://example.com/large-image.jpg"
        style="width: 400px; height: 300px"
        lazy
        @on-lazy-load="onLazyLoad"
        @on-loaded="onLoad"
    />
</template>

<script setup>
import Image from '@/components/Image/Image.vue'

const onLoad = (event) => {
    console.log('图片加载成功', event)
}

const onError = (event) => {
    console.log('图片加载失败', event)
}

const onLazyLoad = (entry) => {
    console.log('图片进入懒加载区域，开始加载', entry)
}
</script>
```

<br>
