<template>
  <div class="login-container">
    <!-- 卡片翻转容器 -->
    <div class="card-container" :class="{ 'flipped': isFlipped }">
      <!-- 登录表单面 -->
      <div class="card-face card-front">
        <div class="login-box">
          <h2 class="title">测盟汇</h2>
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="formData.username"
                placeholder="请输入账号"
                :prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="formData.password"
                type="password"
                placeholder="请输入密码"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <div class="login-options">
                <el-checkbox v-model="rememberPassword">记住密码</el-checkbox>
                <el-button link type="primary" class="forgot-password" @click="toggleCard">忘记密码?</el-button>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                class="login-button"
                :loading="loading"
                @click="handleSubmit"
              >
                登录
              </el-button>
            </el-form-item>

            <div class="register-link">
              <div class="register-options">
                <span>还没有账号? <el-button link type="primary" @click="goToRegister">立即注册</el-button></span>
                <span><el-button link type="primary" @click="goToEnterpriseRegister">企业注册</el-button></span>
              </div>
            </div>
          </el-form>
        </div>
      </div>

      <!-- 找回密码表单面 -->
      <div class="card-face card-back">
        <div class="login-box">
          <h2 class="title">找回密码</h2>
                     <el-form
             ref="resetFormRef"
             :model="resetFormData"
             :rules="resetRules"
             class="login-form"
           >
             <el-form-item prop="username">
               <el-input
                 v-model="resetFormData.username"
                 placeholder="请输入用户名"
                 :prefix-icon="User"
               />
             </el-form-item>

            <el-form-item prop="newPassword">
              <el-input
                v-model="resetFormData.newPassword"
                type="password"
                placeholder="请输入新密码"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                v-model="resetFormData.confirmPassword"
                type="password"
                placeholder="请确认新密码"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                class="login-button"
                :loading="resetLoading"
                @click="handleResetPassword"
              >
                重置密码
              </el-button>
            </el-form-item>

                         <div class="register-link">
               <el-button link type="primary" @click="toggleCard">
                 返回登录
               </el-button>
             </div>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 滑动拼图验证码 -->
    <SliderCaptcha
      v-model:visible="showCaptcha"
      @success="onCaptchaSuccess"
      @fail="onCaptchaFail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { login, resetPassword } from '@/api/user'
import { useUserStore } from '@/stores/user'
import SliderCaptcha from '@/components/SliderCaptcha/SliderCaptcha.vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const resetFormRef = ref<FormInstance>()
const loading = ref(false)
const resetLoading = ref(false)
const rememberPassword = ref(false)

// 卡片翻转状态
const isFlipped = ref(false)

// 验证码相关
const showCaptcha = ref(false)
const captchaVerified = ref(false)

// 登录表单数据
const formData = reactive({
  username: '',
  password: ''
})

// 找回密码表单数据
const resetFormData = reactive({
  username: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const resetRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '用户名长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== resetFormData.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 切换卡片面
const toggleCard = () => {
  isFlipped.value = !isFlipped.value
  // 清空表单数据
  if (isFlipped.value) {
    // 切换到找回密码面，清空找回密码表单
    resetFormData.username = ''
    resetFormData.newPassword = ''
    resetFormData.confirmPassword = ''
  }
}

// 处理重置密码
const handleResetPassword = async () => {
  if (!resetFormRef.value) {
    ElMessage.warning('表单未准备好，请重试')
    return
  }
  
  try {
    await resetFormRef.value.validate(async (valid) => {
      if (valid) {
        resetLoading.value = true
        console.log('=== 开始重置密码 ===')
        console.log('用户名:', resetFormData.username)
        console.log('新密码长度:', resetFormData.newPassword.length)
        console.log('API请求参数:', { 
          username: resetFormData.username, 
          newPassword: resetFormData.newPassword.substring(0, 2) + '***' 
        })
        
        try {
          // 调用重置密码的API
          const result = await resetPassword({
            username: resetFormData.username,
            newPassword: resetFormData.newPassword
          })
          
          console.log('=== 重置密码API响应 ===')
          console.log('完整响应:', result)
          
          if (result && (result.code === 0 || result.code === 200 || result.code === undefined)) {
            ElMessage.success('密码重置成功，请使用新密码登录')
            console.log('密码重置成功')
            
            // 切换回登录面
            setTimeout(() => {
              toggleCard()
            }, 1500) // 延迟1.5秒让用户看到成功提示
          } else {
            console.error('API返回失败状态:', result)
            ElMessage.error(result.message || '密码重置失败')
          }
          
        } catch (error: any) {
          console.error('=== 重置密码失败 ===')
          console.error('错误对象:', error)
          console.error('错误响应:', error.response)
          
          // 优化错误消息显示
          let errorMessage = '密码重置失败'
          
          if (error.response) {
            // 服务器返回错误响应
            console.log('服务器错误状态码:', error.response.status)
            console.log('服务器错误数据:', error.response.data)
            
            const responseData = error.response.data
            if (responseData && responseData.message) {
              errorMessage = responseData.message
            } else if (responseData && typeof responseData === 'string') {
              errorMessage = responseData
            } else {
              errorMessage = `服务器错误 (${error.response.status})`
            }
          } else if (error.message) {
            // 网络错误或其他错误
            console.log('其他错误:', error.message)
            errorMessage = error.message
          }
          
          console.log('最终错误消息:', errorMessage)
          ElMessage.error(errorMessage)
        } finally {
          resetLoading.value = false
          console.log('=== 重置密码流程结束 ===')
        }
      } else {
        ElMessage.warning('请检查输入内容是否正确')
        console.log('表单验证失败')
      }
    })
  } catch (error: any) {
    console.error('=== 表单验证异常 ===')
    console.error('验证错误:', error)
    ElMessage.error('表单验证失败，请检查输入内容')
    resetLoading.value = false
  }
}

// 保存登录信息到本地存储
const saveLoginInfo = () => {
  if (rememberPassword.value) {
    const loginInfo = {
      username: formData.username,
      password: formData.password,
      rememberPassword: true
    }
    localStorage.setItem('loginInfo', JSON.stringify(loginInfo))
  } else {
    localStorage.removeItem('loginInfo')
  }
}

// 从本地存储获取登录信息
const getLoginInfo = () => {
  const loginInfo = localStorage.getItem('loginInfo')
  if (loginInfo) {
    const { username, password, rememberPassword: remembered } = JSON.parse(loginInfo)
    formData.username = username
    formData.password = password
    rememberPassword.value = remembered
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate(async (valid) => {
      if (valid) {
        // 显示验证码
        showCaptcha.value = true
      }
    })
  } catch (error: any) {
    console.error('表单验证失败:', error)
    ElMessage.error('请检查输入内容是否正确')
  }
}

// 验证码验证成功后执行登录
const performLogin = async () => {
  loading.value = true
  try {
    const res = await login({
      username: formData.username,
      password: formData.password
    })
    // 后端直接返回 token 字符串
    const token = res.data
    if (token) {
      // 保存登录信息（如果选择了记住密码）
      saveLoginInfo()
      
      userStore.setToken(token)
      await userStore.fetchUserInfo()
      ElMessage.success('登录成功')
      router.push('/dashboard')
    } else {
      ElMessage.error('登录失败：未获取到 token')
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    ElMessage.error(error.message || '登录失败，请重试')
  } finally {
    loading.value = false
  }
}

// 验证码验证成功
const onCaptchaSuccess = () => {
  captchaVerified.value = true
  showCaptcha.value = false
  ElMessage.success('验证成功')
  // 执行登录
  performLogin()
}

// 验证码验证失败
const onCaptchaFail = () => {
  captchaVerified.value = false
  ElMessage.warning('验证失败，请重试')
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}

// 跳转到企业注册页面
const goToEnterpriseRegister = () => {
  router.push('/enterprise-register')
}

// 在组件挂载时获取保存的登录信息
onMounted(() => {
  getLoginInfo()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.login-container {
  font-family: "Poppins", sans-serif;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('@/assets/6.png') no-repeat center center;
  background-size: cover;
  background-position: center;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  perspective: 1000px;
}

/* 卡片翻转容器 */
.card-container {
  position: relative;
  width: 400px;
  min-height: 500px;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.card-container.flipped {
  transform: rotateY(180deg);
}

/* 卡片面 */
.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
}

.card-front {
  z-index: 2;
}

.card-back {
  transform: rotateY(180deg);
  z-index: 1;
}

.login-box {
  position: relative;
  width: 100%;
  min-height: 500px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 40px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.login-box:hover {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}

.title {
  font-size: 2em;
  color: #fff;
  text-align: center;
  margin: 0 0 30px 0;
  font-weight: 600;
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 25px;
}

.login-form :deep(.el-input) {
  height: 50px;
  background: transparent;
}

.login-form :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  padding: 0 40px 0 15px !important;
  height: 50px !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease !important;
}

.login-form :deep(.el-input__wrapper:hover) {
  background-color: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: none !important;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2) !important;
}

.login-form :deep(.el-input__inner) {
  color: #fff !important;
  background: transparent !important;
  border: none !important;
  font-size: 1em !important;
  height: 50px !important;
  line-height: 50px !important;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 1em !important;
}

.login-form :deep(.el-input__prefix) {
  color: #fff !important;
  font-size: 1.2em !important;
  line-height: 50px !important;
}

.login-form :deep(.el-input__suffix) {
  color: #fff !important;
  line-height: 50px !important;
}

.login-form :deep(.el-input__password) {
  color: #fff !important;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -10px 0 15px;
  font-size: 0.9em;
  color: #fff;
  width: 100%;
}

.login-options :deep(.el-checkbox) {
  color: #fff;
}

.login-options :deep(.el-checkbox__label) {
  color: #fff !important;
  font-size: 1em !important;
}

.login-options :deep(.el-checkbox__inner) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  transition: all 0.3s ease !important;
}

.login-options :deep(.el-checkbox__inner:hover) {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
}

.login-options :deep(.el-checkbox.is-checked .el-checkbox__inner) {
  background-color: rgba(255, 255, 255, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
}

.login-options :deep(.el-checkbox.is-checked .el-checkbox__inner::after) {
  border-color: #fff !important;
}

.forgot-password {
  color: #fff !important;
  text-decoration: none !important;
  font-size: 1.13em !important;
  padding: 0 !important;
  transition: all 0.3s ease;
}

.forgot-password:hover {
  text-decoration: underline !important;
  transform: scale(1.05);
}

.login-button {
  width: 100% !important;
  height: 45px !important;
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 25px !important;
  cursor: pointer;
  font-size: 1.2em !important;
  font-weight: 600 !important;
  color: #fff !important;
  margin-top: 10px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.login-button:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 5px 15px rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-1px);
}

.login-button:focus {
  background: rgba(255, 255, 255, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 5px 15px rgba(255, 255, 255, 0.2) !important;
}

.register-link {
  font-size: 0.9em;
  color: #fff;
  text-align: center;
  margin: 25px 0 10px;
  width: 100%;
}

.register-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 0.9em;
}

.register-options span {
  color: #fff;
}

.register-link :deep(.el-button) {
  color: #fff !important;
  text-decoration: none !important;
  font-weight: 600 !important;
  font-size: inherit !important;
  padding: 0 !important;
  margin: 0 !important;
  vertical-align: baseline !important;
  transition: all 0.3s ease;
}

.register-link :deep(.el-button:hover) {
  text-decoration: underline !important;
  transform: scale(1.05);
}

/* 响应式设计 */
@media (max-width: 360px) {
  .card-container {
    width: 100%;
  }
  
  .login-box {
    width: 100%;
    height: 100vh;
    border: none;
    border-radius: 0px;
    min-height: 100vh;
  }
  
  .card-face {
    border-radius: 0;
  }
  
  .login-form :deep(.el-input__wrapper) {
    padding: 0 35px 0 5px !important;
  }
}
</style> 