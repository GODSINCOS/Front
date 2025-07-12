// 用户信息接口
export interface UserInfo {
  id: number
  username: string
  nickname: string
  phone: string
  email: string
  gender: string
  enterpriseId?: number
  enterpriseName?: string
  status: number
  avatar: string // 头像Base64数据或URL
  createTime: string
  updateTime: string
  roles?: string[] // 新增：角色列表
  department?: string // 新增：部门信息
  role?: string // 新增：单个角色信息
}

// 登录请求参数
export interface LoginParams {
  username: string
  password: string
}

// 注册请求参数
export interface RegisterParams {
  username: string
  password: string
  companyName: string
  contact: string
  verifyCode: string
}

// 修改密码请求参数
export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
}

// 重置密码请求参数
export interface ResetPasswordParams {
  username: string
  newPassword: string
}

// 更新用户信息请求参数
export interface UpdateUserParams {
  nickname: string
  phone: string
  email: string
  gender: string
}

// 用户列表查询参数
export interface UserListParams {
  page: number
  pageSize: number
  username?: string
  phone?: string
  enterpriseName?: string
  status?: number
  query?: string
}

// 分页查询参数
export interface PageParams {
  page: number
  pageSize: number
  query?: string
}

// 分页响应数据
export interface PageResult<T> {
  list: T[]
  total: number
}

// 响应数据
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
} 