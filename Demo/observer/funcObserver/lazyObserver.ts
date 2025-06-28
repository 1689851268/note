import Observer from '../basicObserver'
import type { Callbacks, ObserverInfo } from '../basicObserver'

/**
 * 懒加载观察器
 * 使用 rootMargin 扩展检测区域，适用于图片懒加载等场景
 */

/** 懒加载回调接口 */
export interface LazyCallbacks extends Callbacks {
    /** 进入懒加载区域时触发 */
    onExposure?: (entry: IntersectionObserverEntry) => void
    /** 离开懒加载区域时触发 */
    onLoseExposure?: (entry: IntersectionObserverEntry) => void
}

/** 懒加载观察元素信息 */
interface LazyInfo extends ObserverInfo {
    callbacks: LazyCallbacks
}

/** 懒加载偏移量（视窗高度的一半） */
const ROOT_MARGIN = `${window.innerHeight / 2}px 0px`

/**
 * 懒加载观察器
 * 提前触发检测，用于元素懒加载场景
 */
export class LazyObserver extends Observer<LazyInfo> {
    /**
     * 构造函数，使用 rootMargin 配置初始化
     */
    constructor() {
        super({ rootMargin: ROOT_MARGIN })
    }

    /**
     * 创建懒加载观察信息
     * @param callbacks 回调函数
     * @returns 懒加载观察信息
     */
    protected createInfo(callbacks: Callbacks): LazyInfo {
        return { callbacks: callbacks as LazyCallbacks }
    }

    /**
     * 处理元素进入懒加载区域事件
     * @param elementInfo 元素信息
     * @param entry 交集观察条目
     */
    protected onVisible(elementInfo: LazyInfo, entry: IntersectionObserverEntry): void {
        elementInfo.callbacks.onExposure?.(entry)
    }

    /**
     * 处理元素离开懒加载区域事件
     * @param elementInfo 元素信息
     * @param entry 交集观察条目
     */
    protected onHidden(elementInfo: LazyInfo, entry: IntersectionObserverEntry): void {
        elementInfo.callbacks.onLoseExposure?.(entry)
    }

    /**
     * 开始观察元素
     * @param element 目标元素
     * @param callbacks 回调函数
     */
    observeElement(element: Element, callbacks: LazyCallbacks): void {
        super.observeElement(element, callbacks)
    }
}

/** 懒加载观察器实例（延迟初始化单例） */
let lazyObserver: LazyObserver | null = null

/**
 * 获取懒加载观察器实例
 * @returns 懒加载观察器实例
 */
function getLazyObserver(): LazyObserver {
    if (!lazyObserver) {
        lazyObserver = new LazyObserver()
    }
    return lazyObserver
}

/**
 * 观察元素懒加载
 * @param element 目标元素
 * @param callbacks 回调函数
 */
export function observe(element: Element, callbacks: LazyCallbacks): void {
    getLazyObserver().observeElement(element, callbacks)
}

/**
 * 停止观察元素
 * @param element 目标元素
 */
export function unobserve(element: Element): void {
    getLazyObserver().unobserveElement(element)
}

/**
 * 断开所有观察
 */
export function disconnect(): void {
    if (lazyObserver) {
        lazyObserver.disconnectAll()
        lazyObserver = null // 重置实例，下次使用时重新创建
    }
}

/**
 * 获取所有观察元素信息
 * @returns 元素信息映射表
 */
export function getElements(): Map<Element, LazyInfo> {
    return getLazyObserver().getElements()
}
