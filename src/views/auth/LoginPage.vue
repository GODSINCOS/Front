<template>
  <div class="login-container">
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
            <el-button link type="primary" class="forgot-password">忘记密码?</el-button>
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
          <p>还没有账号? <el-button link type="primary" @click="goToRegister">立即注册</el-button></p>
        </div>
      </el-form>
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
import { login } from '@/api/user'
import { useUserStore } from '@/stores/user'
import SliderCaptcha from '@/components/SliderCaptcha/SliderCaptcha.vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const rememberPassword = ref(false)

// 验证码相关
const showCaptcha = ref(false)
const captchaVerified = ref(false)

const formData = reactive({
  username: '',
  password: ''
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
}

.login-box {
  position: relative;
  width: 400px;
  min-height: 450px;
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
  margin-bottom: 30px;
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
  margin: -15px 0 15px;
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
}

.forgot-password:hover {
  text-decoration: underline !important;
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

.register-link p {
  color: #fff;
  margin: 0;
  font-size: 0.9em;
}

.register-link :deep(.el-button) {
  color: #fff !important;
  text-decoration: none !important;
  font-weight: 600 !important;
  font-size: inherit !important;
  padding: 0 !important;
  margin: 0 !important;
  vertical-align: baseline !important;
}

.register-link :deep(.el-button:hover) {
  text-decoration: underline !important;
}

/* 响应式设计 */
@media (max-width: 360px) {
  .login-box {
    width: 100%;
    height: 100vh;
    border: none;
    border-radius: 0px;
    min-height: 100vh;
  }
  
  .login-form :deep(.el-input__wrapper) {
    padding: 0 35px 0 5px !important;
  }
}
</style> 