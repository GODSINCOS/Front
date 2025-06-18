import request from '@/utils/request'
import type {
  LoginParams,
  RegisterParams,
  ChangePasswordParams,
  UpdateUserParams,
  PageParams,
  PageResult,
  UserInfo,
  ApiResponse,
  UserListParams
} from '@/types/user'

// 登录
export function login(data: LoginParams) {
  return request<ApiResponse<string>>({
    url: '/auth/login',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 注册
export function register(data: RegisterParams) {
  return request<ApiResponse>({
    url: '/auth/register',
    method: 'post',
    data
  })
}

// 获取验证码
export function getVerifyCode(phone: string) {
  return request<ApiResponse>({
    url: '/auth/verify-code',
    method: 'get',
    params: { phone }
  })
}

// 获取用户信息
export function getUserInfo() {
  return request<ApiResponse<UserInfo>>({
    url: '/users/current',
    method: 'get'
  })
}

// 更新用户信息
export function updateUserInfo(data: UpdateUserParams) {
  return request<ApiResponse>({
    url: '/users/current',
    method: 'put',
    data
  })
}

// 修改密码
export function changePassword(data: ChangePasswordParams) {
  return request<ApiResponse>({
    url: '/users/current/password',
    method: 'put',
    data
  })
}

// 获取用户列表
export function getUserList(params: UserListParams) {
  return request<ApiResponse<PageResult<UserInfo>>>({
    url: '/users',
    method: 'get',
    params
  })
}

// 创建用户
export function createUser(data: Partial<UserInfo>) {
  return request<ApiResponse>({
    url: '/users',
    method: 'post',
    data
  })
}

// 更新用户
export function updateUser(id: number, data: Partial<UserInfo>) {
  return request<ApiResponse>({
    url: `/users/${id}`,
    method: 'put',
    data
  })
}

// 修改用户状态
export function changeUserStatus(id: number, status: number) {
  return request<ApiResponse>({
    url: `/users/${id}/status`,
    method: 'put',
    data: { status }
  })
} 