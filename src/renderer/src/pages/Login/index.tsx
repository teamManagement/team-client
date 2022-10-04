import { FC, useState } from 'react'
import { Button, Form, Input, Link } from 'tdesign-react'
import { UserIcon, LockOnIcon } from 'tdesign-icons-react'
import Avatar from '@renderer/components/Avatar'
import CloseAppBtn from '@renderer/components/CloseAppBtn'
import defaultHeadImg from '../../assets/imgs/default-header.png'
import defaultLoginBg from '../../assets/imgs/default-login-bg.png'
import './index.scss'

export const Login: FC = () => {
  const [icon, setIcon] = useState<string>(defaultHeadImg)
  const [backgroundImg, setBackgroundImg] = useState<string>(defaultLoginBg)
  return (
    <div className="login match-parent" style={{ backgroundImage: `url(${backgroundImg})` }}>
      <div className="header electron-drag">
        <div className="close-btn">
          <CloseAppBtn color="white" size="medium" />
        </div>
        <div className="avatar">
          <Avatar size="100%" iconUrl={icon} />
        </div>
      </div>
      <div className="form">
        <div className="content">
          <Form layout="vertical" resetType="empty" preventSubmitDefault statusIcon>
            <Form.FormItem name="username">
              <Input prefixIcon={<UserIcon />} placeholder="请输入用户名/身份识别号/邮箱" />
            </Form.FormItem>
            <Form.FormItem name="password">
              <Input prefixIcon={<LockOnIcon />} placeholder="请输入用户密码" />
            </Form.FormItem>
            <Form.FormItem>
              <Button block theme="success">
                登录
              </Button>
            </Form.FormItem>
            <Form.FormItem style={{ marginTop: -16 }}>
              <Link theme="primary" hover="underline">
                还没有帐号?
              </Link>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Link theme="primary" hover="underline">
                忘记密码?
              </Link>
              {/* <Button style={{ padding: 0 }} variant="text" theme="primary">
                还没有帐号?
              </Button>
              <Button variant="text" theme="primary">
                忘记密码?
              </Button> */}
            </Form.FormItem>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default Login
