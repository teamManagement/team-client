import { useCallback, useEffect, useState } from 'react'
import doT from 'dot'

export interface TemplateContent {
  type: 'string' | 'template'
  val: string | TemplateObj
  click?(): void
  doubleClick?(): void
  close?(): void
}

export function useTemplate(
  initTmlObj?: TemplateContent
): [string, (tml?: TemplateContent) => void] {
  const [tml, setTml] = useState<TemplateContent | undefined>(initTmlObj || undefined)
  const [tmlStr, setTmlStr] = useState<string>('')

  const renderTml = useCallback((tmlStr: string, data: any) => {
    try {
      setTmlStr(doT.compile(tmlStr)(data))
      //   const _str = doT.compile(tmlStr)(data)
    } catch (e) {
      console.error('模板渲染异常: ', e)
    }
  }, [])

  const repeatStart = useCallback(
    (tmlObj: TemplateObj & { _timeoutId: any; _repeatStart?: boolean }, data: any) => {
      if (tmlObj._repeatStart || typeof tmlObj.repeat !== 'number' || tmlObj.repeat === 0) {
        return
      }

      tmlObj._repeatStart = true
      const repeatFn: (timeout?: number) => void = (timeout) => {
        timeout = timeout || 1000
        if (typeof tmlObj.repeat !== 'number' || tmlObj.repeat <= 0) {
          tmlObj._repeatStart = false
          return
        }
        tmlObj.repeat -= 1

        tmlObj._timeoutId = setTimeout(() => {
          renderTml(tmlObj.tml, data)
          if (typeof tmlObj.repeat !== 'number' || tmlObj.repeat <= 0) {
            tmlObj._repeatStart = false
            return
          }

          repeatFn(tmlObj.repeatInterval)
        }, timeout)
      }

      repeatFn()
    },
    []
  )

  useEffect(() => {
    if (!tml) {
      setTmlStr('')
      return
    }
    if (typeof tml.val === 'string') {
      setTmlStr(tml.val)
      return
    }

    if (typeof tml.val !== 'object') {
      setTmlStr('')
      return
    }

    const _tml = JSON.parse(JSON.stringify(tml.val)) as TemplateObj & {
      click?(): void
      doubleClick?(): void
      close?(): void
      _timeoutId: any
      _repeatStart?: boolean
    }
    if (!_tml || !_tml.tml) {
      setTmlStr('')
      return
    }

    _tml.click = tml.click
    _tml.doubleClick = tml.doubleClick
    _tml.close = tml.close

    const data = {
      data: _tml.data,
      click() {
        _tml.click && _tml.click()
      },
      close() {
        _tml.close && _tml.close()
      },
      doubleClick() {
        _tml.doubleClick && _tml.doubleClick
      }
    } as TemplateRenderDataBase

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    data.updateData = (d: any) => {
      data.data = d
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    data.updateTml = (tmlObj: TemplateObj) => {
      if (typeof tmlObj.repeat === 'boolean' && !tmlObj.repeat) {
        _tml._timeoutId && clearTimeout(_tml._timeoutId)
      } else if (typeof tmlObj.repeat === 'number') {
        _tml.repeat = tmlObj.repeat
      }

      if (typeof tmlObj.repeatInterval === 'number') {
        _tml.repeatInterval = tmlObj.repeatInterval
      }

      if (typeof tmlObj.data !== 'undefined') {
        _tml.data = tmlObj.data
      }

      if (typeof tmlObj.tml === 'string') {
        _tml.tml = tmlObj.tml
      }
    }

    renderTml(_tml.tml, data)
    repeatStart(_tml, data)

    return () => {
      console.log('重新加载。。。')
      _tml._repeatStart = false
      _tml._timeoutId && clearTimeout(_tml._timeoutId)
    }
  }, [tml])

  return [tmlStr, setTml]
}
