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

// 用户注册（新增）
export function userRegister(data: Partial<UserInfo>) {
  return request<ApiResponse>({
    url: '/auth/user/register',
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

// 删除用户
export function deleteUser(id: number) {
  return request<ApiResponse>({
    url: `/users/${id}`,
    method: 'delete'
  })
}

// 批量删除用户
export function batchDeleteUsers(ids: number[]) {
  return request<ApiResponse>({
    url: '/users/batch',
    method: 'delete',
    data: { ids }
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

// 批量修改用户状态
export function batchChangeUserStatus(ids: number[], status: number) {
  return request<ApiResponse>({
    url: '/users/batch/status',
    method: 'put',
    data: { ids, status }
  })
}

// 上传头像
export function uploadAvatar(formData: FormData) {
  return request<ApiResponse>({
    url: '/users/current/avatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取当前用户头像
export function getCurrentUserAvatar() {
  return request<Blob>({
    url: '/users/current/avatar',
    method: 'get',
    responseType: 'blob'
  }).catch(error => {
    // 如果是404错误，表示用户没有头像，返回null
    if (error.response && error.response.status === 404) {
      return null
    }
    // 其他错误继续抛出
    throw error
  })
}

// 获取指定用户头像
export function getUserAvatar(id: number) {
  return request<Blob>({
    url: `/users/${id}/avatar`,
    method: 'get',
    responseType: 'blob'
  })
} 