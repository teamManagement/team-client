import { initSplashScreen } from 'electron-splashscreen'
import { AppIcon, LogoBase64Str } from '../icons'
import { OfficeTemplate } from './common'

export function getInitSplashscreen(): () => void {
  return initSplashScreen({
    mainWindow: {
      show: () => {}
    },
    url: OfficeTemplate,
    icon: AppIcon,
    width: 500,
    height: 300,
    brand: `Teamwork Client (v${require('../../package.json').version})`,
    productName: 'Teamwork',
    website: 'https://apps.byzk.cn',
    backgroundColor: 'rgb(102,102,102)',
    color: 'rgb(102,102,102)',
    text: '正在加载...',
    logo: LogoBase64Str
  })
}
