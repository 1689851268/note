<template>
    <div class="image-container" v-if="!(isError && errorDisplay === 'hide')" ref="containerRef">
        <!-- 骨架屏 -->
        <div v-show="isLoading || (isError && errorDisplay === 'skeleton')" class="skeleton">
            <div class="skeleton-shimmer"></div>
        </div>

        <!-- 图片 -->
        <img
            v-show="!isLoading && !isError"
            v-bind="lazy ? (hasEnteredLazyArea ? { src } : {}) : { src }"
            :alt="alt"
            :style="{ objectFit }"
            @load="onLoad"
            @error="onError"
            class="image"
        />

        <!-- 错误状态 -->
        <div v-if="isError && errorDisplay === 'placeholder'" class="error-placeholder">
            <div class="error-icon">📷</div>
            <div class="error-text">图片加载失败</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { lazyObserve, lazyUnobserve } from '@/observer'
import type { LazyCallbacks } from '@/observer'

// Props 定义
const props = withDefaults(
    defineProps<{
        src: string // 图片源，必传
        objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' // 填充方式，默认 cover
        alt?: string // 图片描述
        errorDisplay?: 'skeleton' | 'hide' | 'placeholder' // 错误时的展示方式
        lazy?: boolean // 是否启用懒加载，默认 false
    }>(),
    {
        objectFit: 'cover',
        alt: '',
        errorDisplay: 'placeholder',
        lazy: false,
    },
)

// Events 定义
const emit = defineEmits<{
    'on-loaded': [event: Event] // 图片加载成功事件
    'on-error': [event: Event] // 图片加载失败事件
    'on-lazy-load': [entry: IntersectionObserverEntry] // 懒加载触发事件
}>()

// 响应式状态
const isLoading = ref(true)
const isError = ref(false)

// 容器引用
const containerRef = ref<HTMLElement>()

// 是否已经进入懒加载区域
const hasEnteredLazyArea = ref(false)

// 图片加载成功处理
const onLoad = (event: Event) => {
    isLoading.value = false
    isError.value = false
    emit('on-loaded', event)
}

// 图片加载失败处理
const onError = (event: Event) => {
    isLoading.value = false
    isError.value = true
    emit('on-error', event)
}

// 懒加载回调函数
const lazyCallbacks: LazyCallbacks = {
    onExposure: (entry: IntersectionObserverEntry) => {
        // 进入懒加载区域
        if (!hasEnteredLazyArea.value) {
            hasEnteredLazyArea.value = true
            emit('on-lazy-load', entry)

            // 一旦进入懒加载区域就停止观察，避免重复触发
            if (containerRef.value) {
                lazyUnobserve(containerRef.value)
            }
        }
    },
}

// 组件挂载时的处理
onMounted(() => {
    if (props.lazy && containerRef.value) {
        // 启用懒加载：开始观察元素
        lazyObserve(containerRef.value, lazyCallbacks)
    }
})

// 组件卸载时清理
onUnmounted(() => {
    if (containerRef.value) {
        lazyUnobserve(containerRef.value)
    }
})
</script>

<style scoped lang="scss">
@use './Image.scss';
</style>
