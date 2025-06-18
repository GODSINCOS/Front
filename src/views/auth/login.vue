<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="title">测盟汇管理系统</h2>
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
          <el-button link type="primary" @click="goToRegister">
            还没有账号？立即注册
          </el-button>
        </div>
      </el-form>
    </div>
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

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const rememberPassword = ref(false)

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
    })
  } catch (error: any) {
    console.error('表单验证失败:', error)
    ElMessage.error('请检查输入内容是否正确')
  }
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
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  /* 您可以在这里添加背景图片 */
  /* background-image: url('@/assets/login-bg.jpg');
  background-size: cover;
  background-position: center; */
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title {
  margin: 0 0 30px;
  text-align: center;
  font-size: 24px;
  color: #303133;
}

.login-form {
  .el-form-item {
    margin-bottom: 25px;
  }

  .el-input {
    height: 40px;
    
    :deep(.el-input__wrapper) {
      padding-left: 11px;
    }
    
    :deep(.el-input__prefix) {
      font-size: 16px;
    }
  }
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: -10px;
}

.login-button {
  width: 100%;
  height: 40px;
}

.register-link {
  text-align: center;
  margin-top: 10px;
}

.register-link .el-button {
  font-size: 14px;
}
</style> 