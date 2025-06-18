import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  withCredentials: true,  // 允许携带认证信息
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    })
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('Response:', response.data)
    
    // 如果响应是原始数据格式（登录接口可能直接返回数据）
    if (response.status === 200 && !response.data.code) {
      return response.data
    }

    const { code, message, data } = response.data

    // 请求成功
    if (code === 0 || code === 200) {  // 兼容两种成功状态码
      return response.data
    }

    // token 过期
    if (code === 401) {
      localStorage.removeItem('token')
      router.push('/login')
      ElMessage.error('登录已过期，请重新登录')
      return Promise.reject(new Error('登录已过期'))
    }

    // 其他错误
    const errorMsg = message || '请求失败'
    ElMessage.error(errorMsg)
    return Promise.reject(new Error(errorMsg))
  },
  (error) => {
    console.error('Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: error.config
    })

    // 处理 401 错误
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      if (error.config.url !== '/auth/login') {
        router.push('/login')
        ElMessage.error('请先登录')
      } else {
        ElMessage.error(error.response.data?.message || '用户名或密码错误')
      }
      return Promise.reject(error)
    }

    // 处理其他错误
    const errorMsg = error.response?.data?.message || error.message || '请求失败'
    ElMessage.error(errorMsg)
    return Promise.reject(error)
  }
)

// 封装请求方法
const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return service(config) as unknown as Promise<T>
}

export default request 