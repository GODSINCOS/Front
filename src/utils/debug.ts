import request from '@/utils/request'
import type { ApiResponse } from '@/types/user'

// 测试用户查询
export function testUser(username: string) {
  return request<ApiResponse>({
    url: `/auth/test-user`,
    method: 'get',
    params: { username }
  })
}

// 测试重置密码（带详细日志）
export async function debugResetPassword(username: string, newPassword: string) {
  console.log('=== 调试重置密码功能 ===')
  console.log('用户名:', username)
  console.log('新密码长度:', newPassword.length)
  
  try {
    // 首先测试用户是否存在
    console.log('1. 测试用户查询...')
    const userResult = await testUser(username)
    console.log('用户查询结果:', userResult)
    
    if (userResult.code !== 0 && userResult.code !== 200) {
      console.error('用户查询失败:', userResult.message)
      return { success: false, error: '用户查询失败: ' + userResult.message }
    }
    
    // 执行重置密码
    console.log('2. 执行重置密码...')
    const resetResult = await request<ApiResponse>({
      url: '/auth/reset-password',
      method: 'post',
      data: {
        username,
        newPassword
      }
    })
    
    console.log('重置密码结果:', resetResult)
    
    if (resetResult.code === 0 || resetResult.code === 200 || resetResult.code === undefined) {
      console.log('✅ 重置密码成功')
      return { success: true, data: resetResult }
    } else {
      console.error('❌ 重置密码失败:', resetResult.message)
      return { success: false, error: resetResult.message }
    }
    
  } catch (error: any) {
    console.error('=== 调试过程中发生错误 ===')
    console.error('错误对象:', error)
    console.error('错误响应:', error.response)
    
    let errorMessage = '未知错误'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return { success: false, error: errorMessage }
  }
}

// 在浏览器控制台中暴露调试函数
if (typeof window !== 'undefined') {
  (window as any).debugResetPassword = debugResetPassword
  (window as any).testUser = testUser
  console.log('调试工具已加载! 可以在控制台使用:')
  console.log('- debugResetPassword("username", "newPassword")')
  console.log('- testUser("username")')
} 