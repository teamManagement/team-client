import { FC, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'tdesign-react'
import { RollbackIcon } from 'tdesign-icons-react'
import CloseAppBtn from '@renderer/components/CloseAppBtn'

export const Title: FC<{ desc?: string }> = ({ desc }) => {
  const navigate = useNavigate()
  const backClick = useCallback(() => {
    navigate('/login', { replace: true })
  }, [])
  return (
    <div className="title electron-drag">
      <div className="back-login flex-align-center">
        <Button
          className="electron-no-drag"
          onClick={backClick}
          theme="default"
          size="medium"
          variant={'text'}
          shape="circle"
          icon={<RollbackIcon style={{ fontSize: 28 }} />}
        />
      </div>
      <div className="desc flex-align-center">{desc}</div>
      <div className="close-btn flex-align-center">
        <CloseAppBtn
          iconStyle={{
            fontSize: 28
          }}
          size="medium"
        />
      </div>
    </div>
  )
}

export default Title
