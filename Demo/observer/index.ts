/** 基础观察器类型导出 */
export type { Callbacks, ObserverInfo } from './basicObserver'

/** 基础观察器相关导出 */
export {
    observe as normalObserve,
    unobserve as normalUnobserve,
    disconnect as normalDisconnect,
    getElements as normalGetElements,
} from './funcObserver/normalObserver'
export type { NormalCallbacks } from './funcObserver/normalObserver'

/** 有效曝光观察器相关导出 */
export {
    observe as effectiveObserve,
    unobserve as effectiveUnobserve,
    disconnect as effectiveDisconnect,
    getElements as effectiveGetElements,
} from './funcObserver/effectiveObserver'
export type { EffectiveCallbacks } from './funcObserver/effectiveObserver'

/** 懒加载观察器相关导出 */
export {
    observe as lazyObserve,
    unobserve as lazyUnobserve,
    disconnect as lazyDisconnect,
    getElements as lazyGetElements,
} from './funcObserver/lazyObserver'
export type { LazyCallbacks } from './funcObserver/lazyObserver'
