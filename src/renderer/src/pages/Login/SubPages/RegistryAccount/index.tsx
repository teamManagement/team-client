import { FC } from 'react'
import Title from '../Title'
import './index.scss'

export const RegistryAccount: FC = () => {
  return (
    <div className="login-full-bg match-parent">
      <div className="content-wrapper">
        <Title desc="帐号注册" />
      </div>
    </div>
  )
}

export default RegistryAccount
