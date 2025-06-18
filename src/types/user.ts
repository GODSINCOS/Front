// 用户信息接口
export interface UserInfo {
  id: number
  username: string
  nickname: string
  phone: string
  email: string
  gender: number
  status: number
  department: string
  role: string
  avatar: string
  createTime: string
  updateTime: string
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

// 更新用户信息请求参数
export interface UpdateUserParams {
  nickname: string
  phone: string
  email: string
  gender: number
}

// 用户列表查询参数
export interface UserListParams {
  page: number
  pageSize: number
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