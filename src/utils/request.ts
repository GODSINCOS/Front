import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 添加 token
    const token = sessionStorage.getItem('token') || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    
    // 如果是 blob 类型，直接返回 blob 数据
    if (response.config.responseType === 'blob') {
      return response.data
    }
    
    // 如果请求成功，直接返回数据
    if (data.code === 0 || data.code === 200 || data.code === undefined) {
      return data
    }
    
    // 处理业务错误
    ElMessage.error(data.message || '请求失败')
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  (error) => {
    console.error('响应错误:', error)
    
    // 处理 HTTP 错误状态码
    if (error.response) {
      const { status, data } = error.response
      
      // 优化错误处理：不在拦截器中显示错误消息，让组件自己处理
      // 但为错误对象添加更详细的信息
      error.message = data?.message || error.message
      error.status = status
      error.data = data
      
      switch (status) {
        case 401:
          // 只有401时才在拦截器中处理，因为需要清除token并跳转
          ElMessage.error('未授权，请重新登录')
          sessionStorage.removeItem('token')
          sessionStorage.removeItem('userInfo')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
          break
        case 404:
          // 对于头像请求的404错误，不抛出错误
          if (error.config.url.includes('/avatar')) {
            return Promise.resolve(null)
          }
          break
      }
    } else if (error.code === 'ECONNABORTED') {
      error.message = '请求超时'
    } else if (!error.message) {
      error.message = '网络连接错误'
    }
    
    return Promise.reject(error)
  }
)

// 导出封装的请求方法
export default function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  return service.request(config)
} 