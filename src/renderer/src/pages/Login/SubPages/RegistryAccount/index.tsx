import { FC, useCallback, useMemo, useState } from 'react'
import { Button, Form, Input, FormRule, MessagePlugin, loading } from 'tdesign-react'
import { LinkIcon, LocationIcon, LockOnIcon, SecuredIcon, UserIcon } from 'tdesign-icons-react'
import { useCountDown } from 'ahooks'
import Title from '../Title'
import './index.scss'

export const RegistryAccount: FC = () => {
  const [form] = Form.useForm()
  const [disabledUsername, setDisabledUsername] = useState<boolean>(true)
  const [disabledEmail, setDisabledEmail] = useState<boolean>(true)
  const [disabledInput, setDisabledInput] = useState<boolean>(true)
  const [disabledSendEmailBtn, setDisabledSendEmailBtn] = useState<boolean>(true)

  const [sendEmailCountDown, setSendEmailCountDown] = useState<number | undefined>(undefined)

  const [countDown] = useCountDown({
    targetDate: sendEmailCountDown,
    onEnd() {
      setDisabledSendEmailBtn(false)
    }
  })

  const validatorUsername = useCallback((val: string) => {
    const reg = /^[a-zA-Z0-9_]*$/
    return reg.test(val)
  }, [])

  const formRules = useMemo(() => {
    return {
      idCode: [{ required: true, message: '身份识别号不能为空' }],
      username: [
        { required: true, message: '用户名不能为空' },
        { validator: validatorUsername, message: '帐号必须由于字母、数字和下划线组成' }
      ],
      email: [
        { required: true, message: '邮箱地址不能为空' },
        { email: true, message: '不符合邮箱地址规则' }
      ]
    } as { [key: string]: FormRule[] }
  }, [])

  const idCodeBlur = useCallback(async () => {
    if ((await form.validate!({ fields: ['idCode'] })) !== true) {
      setDisabledUsername(true)
      setDisabledInput(true)
      setDisabledEmail(true)
      setDisabledSendEmailBtn(true)
      return
    }

    setDisabledUsername(false)
  }, [])

  const usernameBlur = useCallback(async () => {
    if ((await form.validate!({ fields: ['username'] })) !== true) {
      setDisabledEmail(true)
      setDisabledInput(true)
      setDisabledSendEmailBtn(true)
      return
    }
    setDisabledEmail(false)
  }, [])

  const emailBlur = useCallback(async () => {
    if ((await form.validate!({ fields: ['email'] })) !== true) {
      setDisabledInput(true)
      setDisabledSendEmailBtn(true)
      return
    }
    setDisabledSendEmailBtn(false)
  }, [])

  const getVerifyCodeBtnClick = useCallback(async () => {
    if ((await form.validate!({ fields: ['idCode', 'username', 'email'] })) !== true) {
      return
    }
    const username = form.getFieldValue!('username')
    const idCode = form.getFieldValue!('idCode')
    const email = form.getFieldValue!('idCode')

    const loadingInstance = loading(true)
    setDisabledSendEmailBtn(true)
    try {
      const emailAddress = await window.proxyApi.httpWebServerProxy<string>(
        'check/username/send/verify/' + username,
        {
          jsonData: {
            idCode,
            email
          }
        }
      )
      MessagePlugin.success(`验证码已发送至${emailAddress}请注意查收`)
      setSendEmailCountDown(Date.now() + 1000 * 60)
      setDisabledSendEmailBtn(true)
      setDisabledInput(false)
    } catch (e) {
      setDisabledSendEmailBtn(false)
      const errInfo = e as ResponseError
      MessagePlugin.error(errInfo.message)
    } finally {
      loadingInstance.hide()
    }
  }, [])

  return (
    <div className="login-full-bg match-parent">
      <div className="content-wrapper">
        <Title desc="帐号注册" />
        <div className="form-content">
          <Form
            form={form}
            rules={formRules}
            statusIcon={false}
            preventSubmitDefault
            layout="vertical"
          >
            <Form.FormItem name="idCode">
              <Input
                onBlur={idCodeBlur}
                prefixIcon={<LocationIcon />}
                placeholder="请输入用户身份识别号"
              />
            </Form.FormItem>
            <Form.FormItem name="username">
              <Input
                onBlur={usernameBlur}
                prefixIcon={<UserIcon />}
                disabled={disabledUsername}
                placeholder="请输入用户名"
              />
            </Form.FormItem>
            <Form.FormItem name="email">
              <Input
                onBlur={emailBlur}
                prefixIcon={<LinkIcon />}
                disabled={disabledEmail}
                placeholder="请输入邮箱地址"
              />
            </Form.FormItem>
            <Form.FormItem name="verifyCode">
              <Input
                prefixIcon={<SecuredIcon />}
                disabled={disabledInput}
                placeholder="请输入邮箱验证码"
              />
              <Button
                onClick={getVerifyCodeBtnClick}
                theme={disabledSendEmailBtn ? 'default' : 'success'}
                disabled={disabledSendEmailBtn}
                style={{ marginLeft: 18 }}
              >
                {countDown === 0 ? '获取验证码' : `等待${Math.round(countDown / 1000)}s`}
              </Button>
            </Form.FormItem>
            <Form.FormItem name="password">
              <Input
                disabled={disabledInput}
                prefixIcon={<LockOnIcon />}
                type="password"
                placeholder="请输入密码"
              />
            </Form.FormItem>
            <Form.FormItem name="confirmPassword">
              <Input
                disabled={disabledInput}
                prefixIcon={<LockOnIcon />}
                type="password"
                placeholder="请再次输入密码"
              />
            </Form.FormItem>
            <Form.FormItem>
              <Button disabled={disabledInput} type="submit" block theme="success">
                注&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;册
              </Button>
            </Form.FormItem>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default RegistryAccount
