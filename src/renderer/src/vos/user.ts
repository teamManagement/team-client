export interface OrgInfo {
  id: string
  name: string
  pid: string
  icon: string
  desc: string
}

export interface PostInfo {
  id: string
  name: string
}

export interface JobInfo {
  id: string
  name: string
}

export interface UserOrgInfo {
  org: OrgInfo
  post: PostInfo
  job: JobInfo
  isMain: boolean
}
/**
 * 用户信息
 */
export interface UserInfo {
  /**
   * 用户ID
   */
  id: string
  /**
   * 用户真实姓名
   */
  name: string
  /**
   * 用户名
   */
  username: string
  /**
   * 身份识别号
   */
  idCode: string
  /**
   * 手机号
   */
  phone: string
  /**
   * 邮箱
   */
  email: string
  /**
   * 头像
   */
  icon: string
  /**
   * 机构信息
   */
  orgList?: UserOrgInfo[]
}
