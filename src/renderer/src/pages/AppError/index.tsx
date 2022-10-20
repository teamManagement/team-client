import { FC, useMemo } from 'react'
import errorJpg from './error.jpg'
import './index.scss'
import { useSearchParams } from 'react-router-dom'

export const AppError: FC = () => {
  const [params] = useSearchParams()
  const errInfo = useMemo(() => {
    const errInfoB64 = params.get('errInfo')
    if (!errInfoB64) {
      return ''
    }
    return window.atob(errInfoB64)
  }, [params])
  return (
    <div className="errorpPage-wrap">
      <div className="errorpPage-box">
        <div className="errorpPage-img">
          <img src={errorJpg} />
        </div>
        <div className="errorpPage-tip">
          <h3>
            打开应用失败, 请关闭后重新尝试
            <br />
            如长时间无法使用请联系管理员或作者！
          </h3>
          <h4>本次错误信息人如下:</h4>
          <h3
            title={errInfo}
            style={{
              overflow: 'auto',
              maxWidth: '100%'
            }}
          >
            {errInfo}
          </h3>
          {/* <!--<p>对不起！没找到待办文档，请联系管理员！</p>--> */}
        </div>
        <div className="errorpPage-operate">
          {/* <a href="javascript:window.location.reload();">
              <span className="glyphicon glyphicon-refresh"></span>刷新试试
          </a>
          <a href="/404pages/index.html">
              <span className="glyphicon glyphicon-home"></span>返回首页
          </a>
          <a href="url" onclick="javascript:window.history.back(-1);return false;">
              <span className="glyphicon glyphicon-repeat"></span>返回上一页
          </a> */}
        </div>
      </div>
    </div>
  )
}

export default AppError
