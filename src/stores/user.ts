import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/types/user'
import { getUserInfo } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  // 设置 token
  function setToken(value: string) {
    token.value = value
    localStorage.setItem('token', value)
  }

  // 清除 token
  function clearToken() {
    token.value = ''
    localStorage.removeItem('token')
  }

  // 获取用户信息
  async function fetchUserInfo() {
    try {
      const res = await getUserInfo()
      userInfo.value = res.data
      return res.data
    } catch {
      return null
    }
  }

  // 退出登录
  function logout() {
    clearToken()
    userInfo.value = null
  }

  return {
    token,
    userInfo,
    setToken,
    clearToken,
    fetchUserInfo,
    logout
  }
}) 