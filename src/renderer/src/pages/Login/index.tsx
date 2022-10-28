import { FC, useCallback, useState, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Form,
  FormRule,
  Input,
  Link,
  Loading,
  MessagePlugin,
  SubmitContext,
  loading as loadingFn,
  InputValue
} from 'tdesign-react'
import { UserIcon, LockOnIcon } from 'tdesign-icons-react'
import { sha1 } from 'hash.js'
import Avatar from '@renderer/components/Avatar'
import CloseAppBtn from '@renderer/components/CloseAppBtn'
import defaultHeadImg from '../../assets/imgs/default-header.png'
import defaultLoginBg from '../../assets/imgs/default-login-bg.png'
import './index.scss'

const formRules: { [key: string]: FormRule[] } = {
  username: [{ required: true, message: '用户名不能为空' }],
  password: [{ required: true, message: '密码不能为空' }]
}

export const Login: FC = () => {
  const navigate = useNavigate()

  const [icon, setIcon] = useState<{
    name?: string
    url?: string
  }>({
    url: defaultHeadImg
  })
  const [backgroundImg] = useState<string>(defaultLoginBg)
  const [loading, setLoading] = useState<boolean>(false)
  const [form] = Form.useForm()

  const loginSubmit = useCallback(async (context: SubmitContext) => {
    if (context.validateResult !== true) {
      return
    }

    const username = form.getFieldValue!('username')
    const password = sha1().update(form.getFieldValue!('password')).digest('hex')
    const loadingInstance = loadingFn(true)
    try {
      await window.api.login(username, password)
    } catch (e) {
      MessagePlugin.error((e as any).message || e)
    } finally {
      loadingInstance.hide()
    }
  }, [])

  const usernameBlur = useCallback(async () => {
    const username = form.getFieldValue!('username')
    if (!username) {
      return
    }

    setLoading(true)
    try {
      const userIcon = await window.proxyApi.httpWebServerProxy<string>(
        'check/username/' + username
      )
      const iconInfo = { url: '', name: '' }
      if (userIcon.startsWith('name:')) {
        iconInfo.name = userIcon.substring(5)
      } else {
        iconInfo.url = userIcon
      }
      setIcon(iconInfo)
    } catch (e) {
      const errInfo = e as ResponseError
      MessagePlugin.error({ content: errInfo.message, placement: 'center' })
      setIcon({ url: defaultHeadImg, name: undefined })
    } finally {
      setLoading(false)
    }
  }, [])

  const breakToForgotPassword = useCallback(() => {
    navigate('/login/forgotPassword', { replace: true })
  }, [])

  const breakToRegistryAccount = useCallback(() => {
    navigate('/login/registryAccount', { replace: true })
  }, [])

  const keyUpSubmitForm = useCallback(
    (_val: InputValue, ctx: { e: KeyboardEvent<HTMLInputElement> }) => {
      if (ctx.e.key.toLocaleLowerCase() === 'enter') {
        form.submit!()
      }
    },
    []
  )

  return (
    <Loading showOverlay loading={loading} text="正在登录...">
      <div className="login match-parent" style={{ backgroundImage: `url(${backgroundImg})` }}>
        <div className="header electron-drag">
          <div className="close-btn">
            <CloseAppBtn color="white" size="medium" />
          </div>
          <div className="avatar">
            {icon.url && <Avatar size="100%" iconUrl={icon.url} />}
            {icon.name && <Avatar disabledNameAutoLen size="68px" name={icon.name} />}
          </div>
        </div>
        <div className="form">
          <div className="content">
            <Form
              form={form}
              onSubmit={loginSubmit}
              rules={formRules}
              layout="vertical"
              resetType="empty"
              preventSubmitDefault
            >
              <Form.FormItem name="username">
                <Input
                  onKeyup={keyUpSubmitForm}
                  onBlur={usernameBlur}
                  prefixIcon={<UserIcon />}
                  placeholder="请输入用户名/身份识别号/邮箱"
                />
              </Form.FormItem>
              <Form.FormItem name="password">
                <Input
                  onKeyup={keyUpSubmitForm}
                  prefixIcon={<LockOnIcon />}
                  type="password"
                  placeholder="请输入用户密码"
                />
              </Form.FormItem>
              <Form.FormItem>
                <Button type="submit" block theme="success">
                  登录
                </Button>
              </Form.FormItem>
              <Form.FormItem style={{ marginTop: -16 }}>
                <Link onClick={breakToRegistryAccount} theme="primary" hover="underline">
                  还没有帐号?
                </Link>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Link onClick={breakToForgotPassword} theme="primary" hover="underline">
                  忘记密码?
                </Link>
              </Form.FormItem>
            </Form>
          </div>
        </div>
      </div>
    </Loading>
  )
}

export default Login
