/**
 * 忽略错误包装
 * @param fn 要执行的函数
 * @returns 函数的执行结果, 如果发生错误返回undefined
 */
export function ignoreErrorWrapper<T>(fn: () => T): T | undefined {
  try {
    return fn()
  } catch (e) {
    console.warn('忽略错误信息: ', e)
    return undefined
  }
}
