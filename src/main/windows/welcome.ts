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
    brand: `团队协作 (v${require('../../package.json').version})`,
    productName: '团队协作平台',
    website: 'https://apps.byzk.cn',
    backgroundColor: 'rgb(102,102,102)',
    color: 'rgb(102,102,102)',
    text: '正在加载...',
    logo: LogoBase64Str
  })
}
