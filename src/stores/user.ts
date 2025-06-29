import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
        const userData = (res.data as any).user || res.data
        const roles = (res.data as any).roles || userData.roles || []
        userInfo.value = { ...userData, roles }
        return userInfo.value
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 检查是否是管理员
  const isAdmin = computed(() => {
    if (!userInfo.value?.roles) return false
    
    const roles = userInfo.value.roles
    
    // 兼容多种数据格式：数组中可能包含角色对象、角色ID或角色代码
    if (Array.isArray(roles)) {
      return roles.some(role => {
        // 如果是对象格式，检查ID或code字段
        if (typeof role === 'object' && role !== null) {
          return role.id === 1 || role.code === 'ROLE_ADMIN'
        }
        // 如果是字符串格式，直接检查
        if (typeof role === 'string') {
          return role === 'ROLE_ADMIN' || role === '管理员'
        }
        // 如果是数字格式，检查角色ID
        if (typeof role === 'number') {
          return role === 1
        }
        return false
      })
    }
    
    // 如果roles不是数组，可能是单个角色
    if (typeof roles === 'object' && roles !== null) {
      return roles.id === 1 || roles.code === 'ROLE_ADMIN'
    }
    
    if (typeof roles === 'string') {
      return roles === 'ROLE_ADMIN' || roles === '管理员'
    }
    
    if (typeof roles === 'number') {
      return roles === 1
    }
    
    return false
  })

  // 检查是否有用户管理权限
  const hasUserManagePermission = computed(() => {
    // 管理员拥有所有权限，包括用户管理
    return isAdmin.value
  })

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
    isAdmin,
    hasUserManagePermission,
    logout
  }
}) 