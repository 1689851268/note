import Observer from '../basicObserver'
import type { Callbacks, ObserverInfo } from '../basicObserver'

/**
 * 基础可见性观察器
 * 提供简单的元素可见性检测功能
 */

/** 基础可见性回调接口 */
export interface NormalCallbacks extends Callbacks {
    /** 元素进入可见区域时触发 */
    onExposure?: (entry: IntersectionObserverEntry) => void
    /** 元素离开可见区域时触发 */
    onLoseExposure?: (entry: IntersectionObserverEntry) => void
}

/** 基础观察元素信息 */
interface NormalInfo extends ObserverInfo {
    callbacks: NormalCallbacks
}

/**
 * 基础可见性观察器
 * 使用默认配置检测元素可见性
 */
export class NormalObserver extends Observer<NormalInfo> {
    /**
     * 创建基础观察信息
     * @param callbacks 回调函数
     * @returns 基础观察信息
     */
    protected createInfo(callbacks: Callbacks): NormalInfo {
        return { callbacks: callbacks as NormalCallbacks }
    }

    /**
     * 处理元素可见事件
     * @param elementInfo 元素信息
     * @param entry 交集观察条目
     */
    protected onVisible(elementInfo: NormalInfo, entry: IntersectionObserverEntry): void {
        elementInfo.callbacks.onExposure?.(entry)
    }

    /**
     * 处理元素隐藏事件
     * @param elementInfo 元素信息
     * @param entry 交集观察条目
     */
    protected onHidden(elementInfo: NormalInfo, entry: IntersectionObserverEntry): void {
        elementInfo.callbacks.onLoseExposure?.(entry)
    }

    /**
     * 开始观察元素
     * @param element 目标元素
     * @param callbacks 回调函数
     */
    observeElement(element: Element, callbacks: NormalCallbacks): void {
        super.observeElement(element, callbacks)
    }
}

/** 基础观察器实例（延迟初始化单例） */
let normalObserver: NormalObserver | null = null

/**
 * 获取基础观察器实例
 * @returns 基础观察器实例
 */
function getNormalObserver(): NormalObserver {
    if (!normalObserver) {
        normalObserver = new NormalObserver()
    }
    return normalObserver
}

/**
 * 观察元素可见性
 * @param element 目标元素
 * @param callbacks 回调函数
 */
export function observe(element: Element, callbacks: NormalCallbacks): void {
    getNormalObserver().observeElement(element, callbacks)
}

/**
 * 停止观察元素
 * @param element 目标元素
 */
export function unobserve(element: Element): void {
    getNormalObserver().unobserveElement(element)
}

/**
 * 断开所有观察
 */
export function disconnect(): void {
    if (normalObserver) {
        normalObserver.disconnectAll()
        normalObserver = null // 重置实例，下次使用时重新创建
    }
}

/**
 * 获取所有观察元素信息
 * @returns 元素信息映射表
 */
export function getElements(): Map<Element, NormalInfo> {
    return getNormalObserver().getElements()
}
