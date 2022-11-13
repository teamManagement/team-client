import { useSize } from 'ahooks'
import { useEffect, useState } from 'react'

export function useContentWidthSize(subWidth: () => number | undefined): number {
  const [width, setWidth] = useState<number>(0)
  const bodySize = useSize(document.body)
  useEffect(() => {
    if (!bodySize) {
      setWidth(0)
      return
    }
    const sub = subWidth()
    if (typeof sub !== 'number') {
      setWidth(0)
      return
    }

    setWidth(bodySize.width - sub)
  }, [bodySize, subWidth])

  return width
}
