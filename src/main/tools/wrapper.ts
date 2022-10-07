export async function promiseErrWrapper<T, E>(prev: Promise<T>): Promise<T | E> {
  try {
    return await prev
  } catch (e) {
    const targetErr = e as any
    targetErr.error = true
    return targetErr
  }
}
