import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfo } from '@/api/user'
import type { UserInfo } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(sessionStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  // 设置token
  const setToken = (newToken: string) => {
    token.value = newToken
    sessionStorage.setItem('token', newToken)
  }

  // 获取token
  const getToken = () => {
    if (!token.value) {
      token.value = sessionStorage.getItem('token') || ''
    }
    return token.value
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const res = await getUserInfo()
      if (res.code === 200 || res.code === 0) {
        // API返回的是 { user: {...}, roles: [...] } 格式，提取user和roles
        const userData = res.data.user || res.data
        const roles = res.data.roles || userData.roles || []
        userInfo.value = { ...userData, roles }
        return userInfo.value
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 登出
  const logout = () => {
    console.log('执行logout，清除用户状态')
    token.value = ''
    userInfo.value = null
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('userInfo')
    localStorage.removeItem('token') // 也清除localStorage中可能残留的token
    localStorage.removeItem('userInfo')
    console.log('logout完成，token和userInfo已清除')
  }

  return {
    token,
    userInfo,
    setToken,
    getToken,
    fetchUserInfo,
    logout
  }
}) 