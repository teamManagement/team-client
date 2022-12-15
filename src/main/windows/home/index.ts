import { app, BrowserWindow, Menu, Tray } from 'electron'
import { CurrentInfo, WinNameEnum } from '../../current'
import { AppIcon } from '../../icons'
import { showNotification } from '../../notification'
import { browserWindowListenViewResize } from '../../sdk/insideSdk/applications'
import { WsHandler } from '../../socket'
import { SettingWindow } from '../common'

// let platformTray: Tray | undefined = undefined

export async function SettingHomeWin(
  showOperation?: (win: BrowserWindow) => void
): Promise<BrowserWindow> {
  const bw = await SettingWindow(
    WinNameEnum.HOME,
    {
      width: 1000,
      minWidth: 1000,
      height: 598,
      minHeight: 598,
      frame: false,
      resizable: true,
      transparent: true,
      maximizable: false,
      minimizable: false
    },
    '/home',
    true,
    {
      readyToShowFn(win) {
        initTray()
        if (showOperation) {
          showOperation(win)
        } else {
          win.show()
        }
      },
      closeFn() {
        if (!CurrentInfo.AppTray) {
          return
        }
        CurrentInfo.AppTray.destroy()
        CurrentInfo.AppTray = undefined
      }
    }
  )

  bw.addListener('close', (event) => {
    event.preventDefault()
    bw.hide()
  })

  browserWindowListenViewResize(bw)

  return bw
}

function initTray(): void {
  if (CurrentInfo.AppTray) {
    return
  }
  const menu = Menu.buildFromTemplate([
    {
      label: '打开',
      click(): void {
        CurrentInfo.CurrentWindow?.show()
        CurrentInfo.CurrentWindow?.focus()
      }
    },
    { type: 'separator' },
    {
      label: '退出登录',
      click(): void {
        WsHandler.instance.logout()
      }
    },
    {
      label: '退出程序',
      click(): void {
        app.exit(0)
      }
    },
    { type: 'separator' },
    {
      label: '消息通知测试',
      click(): void {
        showNotification('template', {
          title: '他处登录',
          body: `您当前的帐号正在: 127.0.0.1 上尝试登录, 是否允许进行登录?（允许之后本机将退出登录）`,
          // duration: 1000 * 15,
          duration: -1,
          theme: 'warning',
          closable: true,
          position: 'center',
          bodyClick() {
            console.log('body click...')
          },
          onClose() {
            console.log('消息弹窗被关闭')
          },
          btns: [
            {
              title: {
                tml: '允许( {{=it.data.val-=1}}s{{it.data.val<=0 && it.click();}} )',
                data: {
                  val: 9
                },
                repeat: 8,
                repeatInterval: 1000
              },
              theme: 'danger',
              // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
              click() {
                console.log('单击被触发')
              }
            },
            {
              title: '拒绝',
              theme: 'success',
              // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
              click() {
                console.log('拒绝被点击')
              }
            }
          ]
        })
        // showNotification('template', {
        //   title: '测试',
        //   body: '测试内容',
        //   theme: 'warning',
        //   duration: 0,
        //   closable: true,
        //   position: 'center',
        //   btns: [
        //     {
        //       title: {
        //         tml: '确定({{=it.data.value-=1}}){{it.data.value === 0 && it.close();}}',
        //         data: {
        //           value: 9
        //         },
        //         repeat: 8,
        //         repeatInterval: 1000
        //       }
        //     }
        //   ]
        // })
      }
    }
  ])
  CurrentInfo.AppTray = new Tray(AppIcon)
  CurrentInfo.AppTray.setToolTip('Team Managed')
  CurrentInfo.AppTray.setContextMenu(menu)
  CurrentInfo.AppTray.addListener('double-click', () => {
    CurrentInfo.CurrentWindow?.show()
    CurrentInfo.CurrentWindow?.focus()
  })
}
