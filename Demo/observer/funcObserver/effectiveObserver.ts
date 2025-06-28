import Observer from '../basicObserver'
import type { Callbacks, ObserverInfo } from '../basicObserver'

/**
 * 有效曝光观察器
 * 元素需达到指定可见比例且持续一定时间才触发有效曝光
 */

/** 有效曝光回调接口 */
export interface EffectiveCallbacks extends Callbacks {
    /** 达到有效曝光条件时触发 */
    onExposure?: (entry: IntersectionObserverEntry) => void
    /** 失去有效曝光时触发 */
    onLoseExposure?: (entry: IntersectionObserverEntry) => void
}

/** 有效曝光观察元素信息 */
interface EffectiveInfo extends ObserverInfo {
    /** 曝光计时器 */
    timerId: ReturnType<typeof setTimeout> | null
    callbacks: EffectiveCallbacks
}

/** 最小持续时间（毫秒） */
const MIN_DURATION = 500
/** 可见比例阈值 */
const THRESHOLD = 0.67

/**
 * 有效曝光观察器
 * 基于时间和可见比例的有效曝光检测
 */
export class EffectiveObserver extends Observer<EffectiveInfo> {
    /**
     * 构造函数，使用阈值配置初始化
     */
    constructor() {
        super({ threshold: THRESHOLD })
    }

    /**
     * 创建有效曝光观察信息
     * @param callbacks 回调函数
     * @returns 有效曝光观察信息
     */
    protected createInfo(callbacks: Callbacks): EffectiveInfo {
        return {
            timerId: null,
            callbacks: callbacks as EffectiveCallbacks,
        }
    }

    /**
     * 处理元素可见事件，启动计时器
     * @param elementInfo 元素信息
     * @param entry 交集观察条目
     */
    protected onVisible(elementInfo: EffectiveInfo, entry: IntersectionObserverEntry): void {
        elementInfo.timerId = setTimeout(() => {
            elementInfo.callbacks.onExposure?.(entry)
            elementInfo.timerId = null
        }, MIN_DURATION)
    }

    /**
     * 处理元素隐藏事件，清理计时器或触发失去曝光
     * @param elementInfo 元素信息
     * @param entry 交集观察条目
     */
    protected onHidden(elementInfo: EffectiveInfo, entry: IntersectionObserverEntry): void {
        if (elementInfo.timerId) {
            // 未达到时间阈值，清除计时器
            clearTimeout(elementInfo.timerId)
            elementInfo.timerId = null
        } else {
            // 已达到有效曝光，触发失去曝光
            elementInfo.callbacks.onLoseExposure?.(entry)
        }
    }

    /**
     * 清理定时器资源
     * @param elementInfo 元素信息
     */
    protected cleanup(elementInfo: EffectiveInfo): void {
        if (elementInfo.timerId) {
            clearTimeout(elementInfo.timerId)
            elementInfo.timerId = null
        }
    }

    /**
     * 开始观察元素
     * @param element 目标元素
     * @param callbacks 回调函数
     */
    observeElement(element: Element, callbacks: EffectiveCallbacks): void {
        super.observeElement(element, callbacks)
    }
}

/** 有效曝光观察器实例（延迟初始化单例） */
let effectiveObserver: EffectiveObserver | null = null

/**
 * 获取有效曝光观察器实例
 * @returns 有效曝光观察器实例
 */
function getEffectiveObserver(): EffectiveObserver {
    if (!effectiveObserver) {
        effectiveObserver = new EffectiveObserver()
    }
    return effectiveObserver
}

/**
 * 观察元素有效曝光
 * @param element 目标元素
 * @param callbacks 回调函数
 */
export function observe(element: Element, callbacks: EffectiveCallbacks): void {
    getEffectiveObserver().observeElement(element, callbacks)
}

/**
 * 停止观察元素
 * @param element 目标元素
 */
export function unobserve(element: Element): void {
    getEffectiveObserver().unobserveElement(element)
}

/**
 * 断开所有观察
 */
export function disconnect(): void {
    if (effectiveObserver) {
        effectiveObserver.disconnectAll()
        effectiveObserver = null // 重置实例，下次使用时重新创建
    }
}

/**
 * 获取所有观察元素信息
 * @returns 元素信息映射表
 */
export function getElements(): Map<Element, EffectiveInfo> {
    return getEffectiveObserver().getElements()
}
