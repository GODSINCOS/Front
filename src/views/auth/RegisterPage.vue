<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="title">用户注册</h2>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        class="register-form"
      >
        <div class="form-row">
          <el-form-item prop="username">
            <el-input 
              v-model="formData.username" 
              placeholder="请输入用户名"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="nickname">
            <el-input 
              v-model="formData.nickname" 
              placeholder="请输入昵称"
              :prefix-icon="User"
            />
          </el-form-item>
        </div>

        <div class="form-row">
          <el-form-item prop="phone">
            <el-input 
              v-model="formData.phone" 
              placeholder="请输入手机号"
              :prefix-icon="Phone"
            />
          </el-form-item>
          <el-form-item prop="email">
            <el-input 
              v-model="formData.email" 
              placeholder="请输入邮箱"
              :prefix-icon="Message"
            />
          </el-form-item>
        </div>

        <el-form-item prop="gender">
          <div class="gender-container">
            <span class="gender-label">性别:</span>
            <el-radio-group v-model="formData.gender" class="gender-radio-group">
              <el-radio value="男">男</el-radio>
              <el-radio value="女">女</el-radio>
            </el-radio-group>
          </div>
        </el-form-item>

        <el-form-item prop="enterpriseId">
          <el-select 
            v-model="formData.enterpriseId" 
            placeholder="请选择所属企业" 
            style="width: 100%"
            :prefix-icon="OfficeBuilding"
            :suffix-icon="ArrowDown"
            popper-class="custom-select-dropdown"
          >
            <el-option 
              v-for="enterprise in enterpriseList" 
              :key="enterprise.id" 
              :label="enterprise.name" 
              :value="enterprise.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item prop="avatar">
          <div class="avatar-upload">
            <div class="avatar-preview">
              <el-avatar :size="60" :src="avatarPreview" />
              <span class="avatar-label">头像</span>
            </div>
            <el-upload
              ref="uploadRef"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :on-change="handleAvatarChange"
              :auto-upload="false"
              accept="image/*"
            >
              <el-button type="primary" size="small" class="upload-button">
                选择头像
              </el-button>
            </el-upload>
          </div>
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
          <p>已有账号? <el-button link type="primary" @click="goToLogin">立即登录</el-button></p>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone, Message, OfficeBuilding, ArrowDown } from '@element-plus/icons-vue'
import type { FormInstance, UploadFile, UploadRawFile } from 'element-plus'
import { useRouter } from 'vue-router'
import { userRegister } from '@/api/user'
import type { UserInfo } from '@/types/user'
import { getPublicEnterpriseList, type Enterprise } from '@/api/enterprise'

const router = useRouter()
const formRef = ref<FormInstance>()
const uploadRef = ref()
const loading = ref(false)
const avatarPreview = ref('')
const avatarFile = ref<File | null>(null)
const enterpriseList = ref<Enterprise[]>([])

const formData = reactive<Partial<UserInfo> & { password: string }>({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  gender: '男',
  enterpriseId: undefined,
  status: 1,
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  enterpriseId: [{ required: true, message: '请选择所属企业', trigger: 'change' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 头像上传前的验证
const beforeAvatarUpload = (rawFile: UploadRawFile) => {
  const isImage = rawFile.type.startsWith('image/')
  const isLt2M = rawFile.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像文件大小不能超过 2MB!')
    return false
  }
  return true
}

// 头像选择处理
const handleAvatarChange = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    avatarFile.value = uploadFile.raw
    // 创建预览URL
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(uploadFile.raw)
  }
}

// 将文件转换为Base64字符串
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64String = e.target?.result as string
      // 移除data:image/...;base64,前缀，只保留base64数据
      const base64Data = base64String.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 创建用户数据
        const userData = { ...formData }
        
        // 如果有头像文件，转换为Base64
        if (avatarFile.value) {
          const avatarBase64 = await fileToBase64(avatarFile.value)
          userData.avatar = avatarBase64
        }
        
        await userRegister(userData)
        
        ElMessage.success('注册成功！')
        router.push('/login')
      } catch (error) {
        console.error(error)
        ElMessage.error('注册失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}

// 获取企业列表
const fetchEnterpriseList = async () => {
  try {
    const res = await getPublicEnterpriseList()
    enterpriseList.value = res.data || []
  } catch (error) {
    console.error('获取企业列表失败:', error)
    ElMessage.error('获取企业列表失败')
  }
}

// 页面初始化
onMounted(() => {
  fetchEnterpriseList()
})

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
/* 注意：企业下拉框样式需要使用全局样式 */
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
  min-height: 600px;
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

.register-form :deep(.el-input__password) {
  color: #fff !important;
}

/* 选择框样式 - 与输入框保持一致 */
.register-form :deep(.el-select) {
  width: 100%;
}

.register-form :deep(.el-select .el-input) {
  height: 45px;
  background: transparent;
}

.register-form :deep(.el-select .el-input__wrapper) {
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

.register-form :deep(.el-select .el-input__wrapper:hover) {
  background-color: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: none !important;
}

.register-form :deep(.el-select .el-input__wrapper.is-focus) {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2) !important;
}

.register-form :deep(.el-select .el-input__inner) {
  color: #fff !important;
  background: transparent !important;
  border: none !important;
  font-size: 0.95em !important;
  height: 45px !important;
  line-height: 45px !important;
}

.register-form :deep(.el-select .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 0.95em !important;
}

.register-form :deep(.el-select .el-input__prefix) {
  color: #fff !important;
  font-size: 1.1em !important;
  line-height: 45px !important;
}

.register-form :deep(.el-select .el-input__suffix) {
  color: #fff !important;
  line-height: 45px !important;
}

.register-form :deep(.el-select__icon) {
  color: #fff !important;
  font-size: 14px !important;
}

/* 下拉框样式已移至全局样式块 */

/* 性别选择器样式 - 与其他输入框保持一致 */
.gender-container {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 0 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  height: 45px;
  width: 100%;
  box-sizing: border-box;
}

.gender-container:hover {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.gender-label {
  color: #fff;
  font-size: 0.95em;
  min-width: 40px;
}

.gender-radio-group {
  display: flex;
  justify-content: flex-start;
  flex: 1;
  gap: 20px;
  padding-left: 130px;
}

.gender-radio-group :deep(.el-radio) {
  color: #fff;
  margin-right: 0;
}

.gender-radio-group :deep(.el-radio__label) {
  color: #fff !important;
  font-size: 0.95em !important;
}

.gender-radio-group :deep(.el-radio__inner) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  transition: all 0.3s ease !important;
}

.gender-radio-group :deep(.el-radio__inner:hover) {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
}

.gender-radio-group :deep(.el-radio.is-checked .el-radio__inner) {
  background-color: rgba(255, 255, 255, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
}

.gender-radio-group :deep(.el-radio.is-checked .el-radio__inner::after) {
  background-color: #fff !important;
}

/* 头像上传样式 */
.avatar-upload {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  width: 100%;
}

.avatar-upload:hover {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.avatar-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-label {
  color: #fff;
  font-size: 0.95em;
}

.upload-button {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 15px !important;
  color: #fff !important;
  font-size: 0.9em !important;
  padding: 5px 15px !important;
  height: auto !important;
  transition: all 0.3s ease;
}

.upload-button:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  transform: translateY(-1px);
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
  font-size: 0.9em;
  color: #fff;
  text-align: center;
  margin: 20px 0 0;
  width: 100%;
}

.login-link p {
  color: #fff;
  margin: 0;
  font-size: 0.9em;
}

.login-link :deep(.el-button) {
  color: #fff !important;
  text-decoration: none !important;
  font-weight: 600 !important;
  font-size: inherit !important;
  padding: 0 !important;
  margin: 0 !important;
  vertical-align: baseline !important;
  transition: all 0.3s ease;
}

.login-link :deep(.el-button:hover) {
  text-decoration: underline !important;
  transform: scale(1.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-container {
    padding: 10px;
  }
  
  .register-box {
    padding: 30px;
    max-width: 400px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .title {
    font-size: 1.8em;
  }
}
</style>

<!-- 全局样式 - 用于Element Plus下拉框 -->
<style>
/* 企业选择下拉框全局样式 - 挂载在body下需要全局样式 */
.custom-select-dropdown {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  border-radius: 10px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  max-height: 200px !important;
  overflow: hidden !important;
}

/* Element Plus 内部滚动容器 */
.custom-select-dropdown .el-select-dropdown__wrap {
  max-height: 200px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  scrollbar-width: thin !important;
  scrollbar-color: rgba(255, 255, 255, 0.6) rgba(0, 0, 0, 0.1) !important;
}

.custom-select-dropdown .el-select-dropdown__list {
  max-height: none !important;
  overflow: visible !important;
  padding: 6px 0 !important;
}

/* 下拉框选项样式 */
.custom-select-dropdown .el-select-dropdown__item {
  color: #333 !important;
  background: transparent !important;
  transition: all 0.2s ease !important;
  font-weight: 500 !important;
  padding: 8px 16px !important;
  font-size: 14px !important;
  line-height: 1.4 !important;
}

.custom-select-dropdown .el-select-dropdown__item:hover {
  background: rgba(102, 126, 234, 0.1) !important;
  color: #667eea !important;
}

.custom-select-dropdown .el-select-dropdown__item.is-selected {
  background: rgba(102, 126, 234, 0.15) !important;
  color: #667eea !important;
  font-weight: 600 !important;
}

/* 滚动条样式 - 应用到实际滚动的容器 */
.custom-select-dropdown .el-select-dropdown__wrap::-webkit-scrollbar {
  width: 6px !important;
}

.custom-select-dropdown .el-select-dropdown__wrap::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1) !important;
  border-radius: 3px !important;
  margin: 4px 0 !important;
}

.custom-select-dropdown .el-select-dropdown__wrap::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.6) !important;
  border-radius: 3px !important;
  transition: background 0.3s ease !important;
}

.custom-select-dropdown .el-select-dropdown__wrap::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.8) !important;
}



/* 空状态样式 */
.custom-select-dropdown .el-select-dropdown__empty {
  color: #666 !important;
  text-align: center !important;
  padding: 16px !important;
  font-size: 14px !important;
}
</style>

<style>
/* 注册页面专用下拉菜单样式 - 使用特定类名避免影响其他页面 */
.custom-select-dropdown,
.register-enterprise-dropdown {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 10px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  animation: none !important;
  transition: none !important;
  opacity: 1 !important;
  overflow: hidden !important;
  padding: 0 !important;
}

.custom-select-dropdown .el-select-dropdown__item,
.register-enterprise-dropdown .el-select-dropdown__item {
  color: #fff !important;
  background: transparent !important;
  transition: all 0.2s ease !important;
  margin: 0 !important;
  padding: 12px 16px !important;
  border-radius: 0 !important;
}

.custom-select-dropdown .el-select-dropdown__item:first-child,
.register-enterprise-dropdown .el-select-dropdown__item:first-child {
  border-top-left-radius: 6px !important;
  border-top-right-radius: 6px !important;
}

.custom-select-dropdown .el-select-dropdown__item:last-child,
.register-enterprise-dropdown .el-select-dropdown__item:last-child {
  border-bottom-left-radius: 6px !important;
  border-bottom-right-radius: 6px !important;
}

.custom-select-dropdown .el-select-dropdown__item:hover,
.register-enterprise-dropdown .el-select-dropdown__item:hover {
  background: rgba(255, 255, 255, 0.15) !important;
}

.custom-select-dropdown .el-select-dropdown__item.is-selected,
.register-enterprise-dropdown .el-select-dropdown__item.is-selected {
  background: rgba(255, 255, 255, 0.2) !important;
  font-weight: 600 !important;
}
</style> 