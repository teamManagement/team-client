import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LockOnIcon, UserIcon, SecuredIcon } from 'tdesign-icons-react'
import { sha1 } from 'hash.js'
import {
  Button,
  Form,
  Input,
  loading,
  MessagePlugin,
  FormRule,
  SubmitContext,
  message,
  DialogPlugin
} from 'tdesign-react'
import { api } from '@byzk/teamwork-inside-sdk'
import Title from '../Title'
import './index.scss'

export const ForgotPassword: FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [disableInput, setDisableInput] = useState<boolean>(true)
  const [disableSendEmailBtn, setDisableEmailBtn] = useState<boolean>(true)
  const [waitTime, setWaitTime] = useState<number | undefined>(undefined)
  const usernameBlur = useCallback(() => {
    const username = form.getFieldValue!('username')
    if (!username) {
      setDisableEmailBtn(true)
      return
    }
    setDisableEmailBtn(false)
  }, [])

  useEffect(() => {
    if (typeof waitTime === 'undefined') {
      return
    }
    if (waitTime === 0) {
      setDisableEmailBtn(false)
      setWaitTime(undefined)
      return
    }

    setTimeout(() => {
      setWaitTime(waitTime - 1)
    }, 1000)
  }, [waitTime])

  const getVerifyCodeBtnClick = useCallback(async () => {
    const username = form.getFieldValue!('username')
    const loadingInstance = loading(true)
    setDisableEmailBtn(true)
    try {
      const emailAddress = await api.proxyHttpCoreServer<string>('forgot/send/email/' + username)
      MessagePlugin.success(`验证码已发送至${emailAddress}请注意查收`)
      setWaitTime(60)
      setDisableInput(false)
    } catch (e) {
      setDisableEmailBtn(false)
      const errInfo = e as any
      MessagePlugin.error(errInfo.message)
    } finally {
      loadingInstance.hide()
    }
  }, [])

  const validatorPasswordFormat = useCallback((val: string) => {
    const reg = /^[a-zA-Z0-9_@.]*$/
    return reg.test(val)
  }, [])

  const validatorPasswordConfirm = useCallback((val: string) => {
    return form.getFieldValue!('password') === val
  }, [])

  const formRules = useMemo(() => {
    return {
      username: [{ required: true, message: '用户名不能为空' }],
      verifyCode: [{ required: true, message: '验证码不能为空' }],
      password: [
        { required: true, message: '密码不能为空' },
        { validator: validatorPasswordFormat, message: '密码只能由数字、字母、下划线、点、@组成' },
        { min: 6, message: '密码长度不能小于6位' }
      ],
      confirmPassword: [
        { required: true, message: '确认密码不能为空' },
        { validator: validatorPasswordConfirm, message: '两次密码输入不一致' }
      ]
    } as { [key: string]: FormRule[] }
  }, [])

  const forgotSubmit = useCallback(async (ctx: SubmitContext) => {
    if (ctx.validateResult !== true) {
      return
    }
    const loadingInstance = loading(true)
    try {
      const username = form.getFieldValue!('username')
      await api.proxyHttpCoreServer('forgot/password/' + username, {
        jsonData: {
          verifyCode: form.getFieldValue!('verifyCode'),
          password: sha1().update(form.getFieldValue!('password')).digest('hex')
        }
      })
      const dialog = DialogPlugin.alert({
        body: '密码重置成功',
        confirmBtn: {
          content: '返回登录',
          variant: 'base',
          theme: 'success',
          onClick: () => {
            navigate('/login', { replace: true })
            dialog.hide()
          }
        },
        closeOnOverlayClick: false,
        closeBtn: false
      })
    } catch (e) {
      const resErr = e as any
      message.error(resErr.message)
    } finally {
      loadingInstance.hide()
    }
  }, [])

  return (
    <div className="login-full-bg match-parent">
      <div className="content-wrapper">
        <Title desc="找回密码" />
        <div className="form-content">
          <Form
            onSubmit={forgotSubmit}
            rules={formRules}
            statusIcon={false}
            form={form}
            layout="vertical"
            preventSubmitDefault
          >
            <Form.FormItem name="username">
              <Input
                onBlur={usernameBlur}
                prefixIcon={<UserIcon />}
                placeholder="请输入要找回的用户名/身份识别号/邮箱"
              />
            </Form.FormItem>
            <Form.FormItem name="verifyCode">
              <Input
                prefixIcon={<SecuredIcon />}
                disabled={disableInput}
                placeholder="请输入邮箱验证码"
              />
              <Button
                onClick={getVerifyCodeBtnClick}
                theme={disableSendEmailBtn ? 'default' : 'success'}
                disabled={disableSendEmailBtn}
                style={{ marginLeft: 18 }}
              >
                {waitTime ? `等待${waitTime}s` : '获取验证码'}
              </Button>
            </Form.FormItem>
            <Form.FormItem name="password">
              <Input
                disabled={disableInput}
                type="password"
                prefixIcon={<LockOnIcon />}
                placeholder="请输入要设置的密码"
              />
            </Form.FormItem>
            <Form.FormItem name="confirmPassword">
              <Input
                disabled={disableInput}
                type="password"
                prefixIcon={<LockOnIcon />}
                placeholder="请在此输入密码进行确认"
              />
            </Form.FormItem>
            <Form.FormItem>
              <Button disabled={disableInput} type="submit" block theme="success">
                确认找回
              </Button>
            </Form.FormItem>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
