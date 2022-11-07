import Avatar from '@renderer/components/Avatar'
import CloseAppBtn from '@renderer/components/CloseAppBtn'
import IconFont from '@renderer/components/IconFont'
import { useUserinfo } from '@renderer/hooks'
import { FC, useCallback, useMemo } from 'react'
import { Divider } from 'tdesign-react'
import './index.scss'

export const UserInfo: FC = () => {
  const userinfo = useUserinfo()
  const closeWin = useCallback(() => {
    window.teamworkInsideSdk.currentWindow.close()
  }, [])

  const orgInfo = useMemo(() => {
    const emptyOrgInfo = {
      name: '-',
      job: '-',
      post: '-'
    }

    if (!userinfo || !userinfo.orgList || userinfo.orgList.length === 0) {
      return emptyOrgInfo
    }

    const userOrg = userinfo.orgList[0]
    emptyOrgInfo.name = userOrg.org.name
    emptyOrgInfo.job = userOrg.job.name
    emptyOrgInfo.post = userOrg.post.name

    return emptyOrgInfo
  }, [])

  return (
    <div className="me-info">
      <div className="title electron-drag">
        <CloseAppBtn
          style={{
            float: 'right',
            margin: '8px 8px 0 0'
          }}
          iconStyle={{
            color: '#999'
          }}
          onClick={closeWin}
        />
        <div className="info-name electron-no-drag">
          <Avatar name={userinfo?.name} iconUrl={userinfo?.icon} size="48px" />
          <div className="desc">
            <div
              className="desc-name"
              title={`${userinfo?.username}( ${userinfo?.name} )`}
            >{`${userinfo?.username}( ${userinfo?.name} )`}</div>
            <div className="desc-idCode" title={userinfo?.idCode}>
              <IconFont name="shenfenzheng" />
              <span>{userinfo?.idCode}</span>
            </div>
          </div>
        </div>
      </div>
      <br />
      <Divider align="left" dashed={false} layout="horizontal">
        组织机构
      </Divider>
      <div className="org-info table">
        <div className="item">
          <div className="label">部门:</div>
          <div className="content">{orgInfo.name}</div>
        </div>
        <div className="item">
          <div className="label">岗位:</div>
          <div className="content">{orgInfo.post}</div>
        </div>
        <div className="item">
          <div className="label">职位:</div>
          <div className="content">{orgInfo.job}</div>
        </div>
      </div>
      <Divider align="left" dashed={false} layout="horizontal">
        个人信息
      </Divider>
      <div className="user-info table">
        <div className="item">
          <div className="label">姓&nbsp;&nbsp;&nbsp;&nbsp;名:</div>
          <div className="content">{userinfo?.name || '-'}</div>
        </div>
        <div className="item">
          <div className="label">手机号:</div>
          <div className="content">{userinfo?.phone || '-'}</div>
        </div>
        <div className="item">
          <div className="label">邮&nbsp;&nbsp;&nbsp;&nbsp;箱:</div>
          <div className="content">{userinfo?.email || '-'}</div>
        </div>
      </div>
      {/* <Button style={{}} block theme="success">
            编辑资料
          </Button> */}
    </div>
  )
}
