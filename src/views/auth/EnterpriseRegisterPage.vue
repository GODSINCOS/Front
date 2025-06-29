<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="title">企业注册</h2>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        class="register-form"
      >
        <div class="form-row">
          <el-form-item prop="name">
            <el-input 
              v-model="formData.name" 
              placeholder="请输入企业名称"
              :prefix-icon="OfficeBuilding"
            />
          </el-form-item>
          <el-form-item prop="contact">
            <el-input 
              v-model="formData.contact" 
              placeholder="请输入联系人姓名"
              :prefix-icon="User"
            />
          </el-form-item>
        </div>

        <div class="form-row">
          <el-form-item prop="phone">
            <el-input 
              v-model="formData.phone" 
              placeholder="请输入联系电话"
              :prefix-icon="Phone"
            />
          </el-form-item>
          <el-form-item prop="email">
            <el-input 
              v-model="formData.email" 
              placeholder="请输入联系邮箱"
              :prefix-icon="Message"
            />
          </el-form-item>
        </div>

        <el-form-item>
          <el-button
            type="primary"
            class="register-button"
            :loading="loading"
            @click="handleSubmit"
          >
            注册
          </el-button>
        </el-form-item>
        
        <div class="login-link">
          <p><el-button link type="primary" @click="goToLogin">返回登录</el-button></p>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Phone, Message, OfficeBuilding } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { useRouter } from 'vue-router'
import { registerEnterprise, type SimpleEnterpriseRegisterParams } from '@/api/enterprise'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = reactive<SimpleEnterpriseRegisterParams>({
  name: '',
  contact: '',
  phone: '',
  email: ''
})

const rules = {
  name: [
    { required: true, message: '请输入企业名称', trigger: 'blur' },
    { min: 2, max: 50, message: '企业名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  contact: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '联系人姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入联系邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (valid) {
      loading.value = true
      await registerEnterprise(formData)
      ElMessage.success('企业注册成功！')
      router.push('/login')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '注册失败，请重试')
  } finally {
    loading.value = false
  }
}

// 返回登录
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.register-container {
  font-family: "Poppins", sans-serif;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('@/assets/6.png') no-repeat center center;
  background-size: cover;
  background-position: center;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
}

.register-box {
  position: relative;
  width: 100%;
  max-width: 500px;
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

.register-box:hover {
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

.register-form {
  width: 100%;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .el-form-item {
  flex: 1;
  margin-bottom: 20px;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.register-form :deep(.el-input) {
  height: 45px;
  background: transparent;
}

.register-form :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  padding: 0 40px 0 15px !important;
  height: 45px !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease !important;
}

.register-form :deep(.el-input__wrapper:hover) {
  background-color: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: none !important;
}

.register-form :deep(.el-input__wrapper.is-focus) {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2) !important;
}

.register-form :deep(.el-input__inner) {
  color: #fff !important;
  background: transparent !important;
  border: none !important;
  font-size: 0.95em !important;
  height: 45px !important;
  line-height: 45px !important;
}

.register-form :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 0.95em !important;
}

.register-form :deep(.el-input__prefix) {
  color: #fff !important;
  font-size: 1.1em !important;
  line-height: 45px !important;
}

.register-form :deep(.el-input__suffix) {
  color: #fff !important;
  line-height: 45px !important;
}

.register-button {
  width: 100% !important;
  height: 45px !important;
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 25px !important;
  cursor: pointer;
  font-size: 1.1em !important;
  font-weight: 600 !important;
  color: #fff !important;
  margin-top: 10px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.register-button:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 5px 15px rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-1px);
}

.register-button:focus {
  background: rgba(255, 255, 255, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 5px 15px rgba(255, 255, 255, 0.2) !important;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  width: 100%;
}

.login-link p {
  color: rgba(255, 255, 255, 0.8);
  margin: 8px 0;
  font-size: 0.9em;
}

.login-link .el-button {
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 500 !important;
  padding: 0 !important;
  text-decoration: none !important;
  transition: all 0.3s ease !important;
}

.login-link .el-button:hover {
  color: #fff !important;
  text-decoration: underline !important;
  transform: scale(1.05) !important;
}

:deep(.el-form-item__error) {
  color: #f5a623 !important;
  font-weight: 500 !important;
  background: rgba(245, 166, 35, 0.1) !important;
  padding: 2px 8px !important;
  border-radius: 4px !important;
  margin-top: 5px !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-container {
    padding: 15px;
  }
  
  .register-box {
    margin: 0;
    padding: 30px 25px;
    min-height: 400px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .title {
    font-size: 1.8em;
    margin-bottom: 25px;
  }
  
  .register-form :deep(.el-input) {
    height: 42px;
  }
  
  .register-form :deep(.el-input__wrapper) {
    height: 42px !important;
  }
  
  .register-form :deep(.el-input__inner) {
    height: 42px !important;
    line-height: 42px !important;
  }
  
  .register-button {
    height: 42px !important;
  }
}
</style> 