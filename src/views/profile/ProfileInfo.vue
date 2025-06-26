<template>
  <div class="profile-container">
    <div v-if="pageLoading" class="loading-container" v-loading="pageLoading">
      <div style="height: 200px; display: flex; align-items: center; justify-content: center;">
        <p>正在加载用户信息...</p>
      </div>
    </div>
    <el-tabs v-model="activeTab" v-else>
      <el-tab-pane label="基本资料" name="basic">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="100px"
          class="profile-form"
        >
          <el-form-item label="头像" prop="avatar">
            <div class="avatar-section">
              <el-avatar :size="100" :src="userAvatar" />
              <div class="avatar-actions">
                <el-upload
                  ref="avatarUploadRef"
                  :show-file-list="false"
                  :before-upload="beforeAvatarUpload"
                  :on-change="handleAvatarChange"
                  :auto-upload="false"
                  accept="image/*"
                >
                  <el-button type="primary" size="small">
                    更换头像
                  </el-button>
                </el-upload>
                <el-button 
                  v-if="avatarFile" 
                  type="success" 
                  size="small" 
                  @click="uploadNewAvatar"
                  :loading="avatarUploading"
                >
                  保存头像
                </el-button>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="用户名" prop="username">
            <el-input v-model="formData.username" disabled />
          </el-form-item>

          <el-form-item label="用户昵称" prop="nickname">
            <el-input v-model="formData.nickname" />
          </el-form-item>

          <el-form-item label="手机号码" prop="phone">
            <el-input v-model="formData.phone" maxlength="11" />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="formData.email" />
          </el-form-item>

          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="formData.gender">
              <el-radio value="男">男</el-radio>
              <el-radio value="女">女</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSubmit" :loading="loading">
              保存
            </el-button>
            <el-button @click="handleClose">关闭</el-button>
          </el-form-item>
          

        </el-form>
      </el-tab-pane>

      <el-tab-pane label="修改密码" name="password">
        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="100px"
          class="profile-form"
        >
          <el-form-item label="原密码" prop="oldPassword">
            <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              show-password
              placeholder="请输入原密码"
            />
          </el-form-item>

          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              show-password
              placeholder="请输入新密码"
            />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              show-password
              placeholder="请再次输入新密码"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleChangePassword"
              :loading="passwordLoading"
            >
              保存
            </el-button>
            <el-button @click="resetPasswordForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="个人信息" name="info">
        <div class="info-container">
          <div class="avatar-container">
            <el-avatar :size="100" :src="userAvatar" />
          </div>

          <div class="info-list">
            <div class="info-item">
              <span class="label">用户名称：</span>
              <span class="value">{{ formData.username }}</span>
            </div>
            <div class="info-item">
              <span class="label">手机号码：</span>
              <span class="value">{{ formData.phone }}</span>
            </div>
            <div class="info-item">
              <span class="label">用户邮箱：</span>
              <span class="value">{{ formData.email }}</span>
            </div>
            <div class="info-item">
              <span class="label">性别：</span>
              <span class="value">{{ formData.gender || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="label">所属企业：</span>
              <span class="value">{{ formData.enterpriseName || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="label">所属类别：</span>
              <span class="value">{{ getUserCategory() }}</span>
            </div>
            <div class="info-item">
              <span class="label">创建日期：</span>
              <span class="value">{{ formData.createTime }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, UploadFile, UploadRawFile } from 'element-plus'
import { getUserInfo, updateUserInfo, changePassword, uploadAvatar, getCurrentUserAvatar } from '@/api/user'
import type { UserInfo, UpdateUserParams, ChangePasswordParams } from '@/types/user'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('basic')
const formRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const avatarUploadRef = ref()
const loading = ref(false)
const passwordLoading = ref(false)
const avatarUploading = ref(false)
const pageLoading = ref(true)
const avatarFile = ref<File | null>(null)

// 默认头像
const userAvatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')

const formData = reactive<Partial<UserInfo>>({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  gender: '男',
  enterpriseId: undefined,
  enterpriseName: '',
  createTime: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = {
  nickname: [{ required: true, message: '请输入用户昵称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }]
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 获取用户信息
const fetchUserInfo = async () => {
  pageLoading.value = true
  try {
    const res = await getUserInfo()
    
    if (res && res.data) {
      // 调试：打印返回的用户信息
      console.log('获取到的用户信息:', res.data)
      
      // 提取用户信息 - API返回的是 { user: {...}, roles: [...] } 格式
      const userData = res.data.user || res.data
      
      // 格式化时间字段
      if (userData.createTime) {
        userData.createTime = new Date(userData.createTime).toLocaleString('zh-CN')
      }
      if (userData.updateTime) {
        userData.updateTime = new Date(userData.updateTime).toLocaleString('zh-CN')
      }
      
      // 性别字段现在直接使用字符串，无需转换
      
      Object.assign(formData, userData)
      
      // 调试：打印合并后的formData
      console.log('合并后的formData:', formData)
      
      // 加载用户头像
      await loadUserAvatar()
    } else {
      ElMessage.error('获取用户信息失败：数据格式错误')
    }
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    ElMessage.error(error.message || '获取用户信息失败')
  } finally {
    pageLoading.value = false
  }
}

// 加载用户头像
const loadUserAvatar = async (retryCount = 0) => {
  try {
    // 清除之前的URL对象以避免内存泄漏
    if (userAvatar.value && userAvatar.value.startsWith('blob:')) {
      URL.revokeObjectURL(userAvatar.value)
    }
    
    console.log('开始获取用户头像...')
    const blob = await getCurrentUserAvatar()
    
    if (blob === null) {
      // 用户没有头像（404响应）
      console.log('用户没有头像，使用默认头像')
      userAvatar.value = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    } else if (blob && blob.size > 0) {
      // 成功获取头像
      const url = URL.createObjectURL(blob)
      userAvatar.value = url
      console.log('头像加载成功，大小:', blob.size, '字节')
    } else {
      // blob存在但大小为0
      console.warn('头像数据为空，使用默认头像')
      userAvatar.value = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    }
  } catch (error) {
    console.error('获取头像失败:', error)
    // 重试一次
    if (retryCount < 1) {
      console.log('正在重试获取头像...')
      setTimeout(() => loadUserAvatar(retryCount + 1), 1000)
    } else {
      // 重试失败，使用默认头像
      console.log('重试失败，使用默认头像')
      userAvatar.value = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    }
  }
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
      userAvatar.value = e.target?.result as string
    }
    reader.readAsDataURL(uploadFile.raw)
  }
}

// 上传新头像
const uploadNewAvatar = async () => {
  if (!avatarFile.value) return
  
  avatarUploading.value = true
  try {
    const formData = new FormData()
    formData.append('avatar', avatarFile.value)
    console.log('开始上传头像...')
    await uploadAvatar(formData)
    console.log('头像上传成功')
    ElMessage.success('头像更新成功')
    avatarFile.value = null
    
    // 等待一小段时间确保后端处理完成
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 重新加载头像
    await loadUserAvatar()
    console.log('头像重新加载完成')
    
    // 更新用户状态管理中的用户信息
    try {
      await userStore.fetchUserInfo()
      console.log('用户信息更新完成')
    } catch (error) {
      console.warn('更新用户状态管理失败:', error)
    }
    
    // 触发全局头像更新事件
    window.dispatchEvent(new CustomEvent('avatarUpdated'))
    console.log('头像更新事件已触发')
  } catch (error: any) {
    console.error('头像上传失败:', error)
    ElMessage.error(error.message || '头像上传失败')
    // 恢复原来的头像显示
    await loadUserAvatar()
  } finally {
    avatarUploading.value = false
  }
}

// 提交个人信息
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 只发送需要更新的字段
        const updateData: UpdateUserParams = {
          nickname: formData.nickname || '',
          phone: formData.phone || '',
          email: formData.email || '',
          gender: formData.gender || '男'
        }
        await updateUserInfo(updateData)
        ElMessage.success('保存成功')
        // 重新获取用户信息以更新显示
        await fetchUserInfo()
      } catch (error: any) {
        console.error('保存失败:', error)
        ElMessage.error(error.message || '保存失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 关闭按钮处理
const handleClose = () => {
  // 跳转到首页
  router.push('/dashboard')
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true
      try {
        await changePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
        ElMessage.success('密码修改成功')
        resetPasswordForm()
      } catch (error: any) {
        console.error('密码修改失败:', error)
        ElMessage.error(error.message || '密码修改失败')
      } finally {
        passwordLoading.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  fetchUserInfo() // 重新获取用户信息
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordFormRef.value?.resetFields()
}

// 获取用户类别
const getUserCategory = () => {
  // 根据用户名判断是否为超级管理员
  // admin用户为超级管理员，其他用户为普通用户
  if (formData.username === 'admin') {
    return '超级管理员'
  } else {
    return '普通用户'
  }
}

onMounted(() => {
  fetchUserInfo()
})

// 组件销毁时清理 blob URL
onUnmounted(() => {
  if (userAvatar.value && userAvatar.value.startsWith('blob:')) {
    URL.revokeObjectURL(userAvatar.value)
  }
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
}

.profile-form {
  max-width: 600px;
  margin: 20px auto;
}

.info-container {
  padding: 20px;
}

.avatar-container {
  text-align: center;
  margin-bottom: 30px;
}

.username {
  margin-top: 10px;
  font-size: 20px;
  color: #303133;
}

.info-list {
  max-width: 600px;
  margin: 0 auto;
}

.info-item {
  display: flex;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 22px;
}

.info-item .label {
  width: 100px;
  color: #606266;
}

.info-item .value {
  color: #303133;
  flex: 1;
}

:deep(.el-tabs__nav) {
  margin-bottom: 20px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.loading-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 