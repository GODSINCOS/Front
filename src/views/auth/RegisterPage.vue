<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="title">用户注册</h2>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        class="register-form"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio value="男">男</el-radio>
            <el-radio value="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="所属企业" prop="enterpriseId">
          <el-select v-model="formData.enterpriseId" placeholder="请选择所属企业" style="width: 100%">
            <el-option 
              v-for="enterprise in enterpriseList" 
              :key="enterprise.id" 
              :label="enterprise.name" 
              :value="enterprise.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <div class="avatar-upload">
            <el-avatar :size="80" :src="avatarPreview" />
            <el-upload
              ref="uploadRef"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :on-change="handleAvatarChange"
              :auto-upload="false"
              accept="image/*"
            >
              <el-button type="primary" size="small" style="margin-left: 10px;">
                选择头像
              </el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="register-button" :loading="loading" @click="handleSubmit">
            注册
          </el-button>
          <el-button link type="primary" @click="goToLogin">
            已有账号？立即登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
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
  enterpriseId: null,
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
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.register-box {
  width: 520px;
  padding: 30px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title {
  margin-bottom: 30px;
  text-align: center;
  font-size: 24px;
  color: #303133;
}

.register-button {
  width: 100%;
  margin-bottom: 14px;
}

.register-form {
  .el-form-item:last-child {
    margin-bottom: 0;
    text-align: center;
  }
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style> 