import request from '@/utils/request'

export interface Enterprise {
  id: number
  name: string
  contact: string
  phone: string
  email: string
  status: number
  createTime: string
  updateTime: string
}

export interface SimpleEnterpriseRegisterParams {
  name: string
  contact: string
  phone: string
  email: string
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 企业注册
export function registerEnterprise(data: SimpleEnterpriseRegisterParams) {
  return request<ApiResponse>({
    url: '/auth/enterprise/register',
    method: 'post',
    data
  })
}

// 获取公共企业列表（用于注册页面）
export function getPublicEnterpriseList() {
  return request<ApiResponse<Enterprise[]>>({
    url: '/enterprises/public',
    method: 'get'
  })
}

// 获取企业列表
export function getEnterpriseList(params?: any) {
  return request<ApiResponse<Enterprise[]>>({
    url: '/enterprises',
    method: 'get',
    params
  })
} 