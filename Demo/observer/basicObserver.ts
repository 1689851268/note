/**
 * 基于 IntersectionObserver API 的观察器抽象基类
 */

/** 观察器回调函数接口 */
export interface Callbacks {
    /** 元素进入指定区域时触发 */
    onExposure?: (entry: IntersectionObserverEntry) => void
    /** 元素离开指定区域时触发 */
    onLoseExposure?: (entry: IntersectionObserverEntry) => void
}

/** 观察元素信息接口 */
export interface ObserverInfo {
    callbacks: Callbacks
}

/**
 * 观察器抽象基类
 * 提供通用观察功能，子类实现具体观察逻辑
 */
abstract class Observer<T extends ObserverInfo = ObserverInfo> {
    /** IntersectionObserver 实例 */
    protected observer: IntersectionObserver | null = null
    /** 观察元素信息映射表 */
    protected elementsMap = new Map<Element, T>()

    /**
     * 构造函数
     * @param options IntersectionObserver 配置选项
     */
    constructor(options: IntersectionObserverInit = {}) {
        this.init(options)
    }

    /**
     * 初始化观察器实例
     * @param options IntersectionObserver 配置选项
     */
    private init(options: IntersectionObserverInit): void {
        console.log('Observer_init_options', options)

        if (!window.IntersectionObserver) {
            console.warn('当前环境不支持 IntersectionObserver API')
            return
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const elementInfo = this.elementsMap.get(entry.target)
                if (!elementInfo) return

                if (entry.isIntersecting) {
                    this.onVisible(elementInfo, entry)
                } else {
                    this.onHidden(elementInfo, entry)
                }
            })
        }, options)

        // 页面卸载时自动清理资源
        window.addEventListener('beforeunload', () => this.disconnectAll(), { once: true })
    }

    /**
     * 创建观察元素信息（子类实现）
     * @param callbacks 回调函数
     * @returns 观察元素信息
     */
    protected abstract createInfo(callbacks: Callbacks): T

    /**
     * 处理元素可见事件（子类实现）
     * @param elementInfo 元素信息
     * @param entry 交集观察条目
     */
    protected abstract onVisible(elementInfo: T, entry: IntersectionObserverEntry): void

    /**
     * 处理元素隐藏事件（子类实现）
     * @param elementInfo 元素信息
     * @param entry 交集观察条目
     */
    protected abstract onHidden(elementInfo: T, entry: IntersectionObserverEntry): void

    /**
     * 清理元素资源（子类可重写）
     * @param elementInfo 元素信息
     */
    protected cleanup(elementInfo: T): void {
        void elementInfo
    }

    /**
     * 开始观察元素
     * @param element 目标元素
     * @param callbacks 回调函数
     */
    observeElement(element: Element, callbacks: Callbacks): void {
        if (!this.observer) {
            console.warn('观察器未初始化')
            return
        }

        // 避免重复观察同一元素
        if (this.elementsMap.has(element)) {
            console.warn('元素已在观察中，将替换原有观察配置')
            this.unobserveElement(element)
        }

        const elementInfo = this.createInfo(callbacks)
        this.elementsMap.set(element, elementInfo)
        this.observer.observe(element)
    }

    /**
     * 停止观察元素
     * @param element 目标元素
     */
    unobserveElement(element: Element): void {
        if (!this.observer) {
            console.warn('观察器未初始化')
            return
        }

        if (!this.elementsMap.has(element)) {
            console.warn('元素未被观察')
            return
        }

        const elementInfo = this.elementsMap.get(element)!
        this.cleanup(elementInfo)
        this.elementsMap.delete(element)
        this.observer.unobserve(element)
    }

    /**
     * 断开所有观察并清理资源
     */
    disconnectAll(): void {
        this.elementsMap.forEach((elementInfo) => {
            this.cleanup(elementInfo)
        })
        this.elementsMap.clear()
        this.observer?.disconnect()
        this.observer = null
    }

    /**
     * 获取所有观察元素信息
     * @returns 元素信息映射表的副本
     */
    getElements(): Map<Element, T> {
        return new Map(this.elementsMap)
    }
}

export default Observer
