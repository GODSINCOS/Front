<template>
  <div class="profile-container">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本资料" name="basic">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="100px"
          class="profile-form"
        >
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
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
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
            <h3 class="username">{{ formData.username }}</h3>
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
              <span class="label">所属部门：</span>
              <span class="value">{{ formData.department || '研发部门 / 董事长' }}</span>
            </div>
            <div class="info-item">
              <span class="label">角色名称：</span>
              <span class="value">{{ formData.role || '超级管理员' }}</span>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getUserInfo, updateUserInfo, changePassword } from '@/api/user'
import type { UserInfo, UpdateUserParams, ChangePasswordParams } from '@/types/user'

const router = useRouter()
const activeTab = ref('basic')
const formRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const loading = ref(false)
const passwordLoading = ref(false)

// 默认头像
const userAvatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')

const formData = reactive<Partial<UserInfo>>({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  gender: 1,
  department: '',
  role: '',
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
  try {
    const res = await getUserInfo()
    Object.assign(formData, res.data)
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    ElMessage.error(error.message || '获取用户信息失败')
  }
}

// 提交个人信息
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await updateUserInfo(formData as UpdateUserParams)
        ElMessage.success('保存成功')
        // 更新成功后切换到个人信息标签页
        activeTab.value = 'info'
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
  // 切换到个人信息标签页
  activeTab.value = 'info'
  // 重新获取用户信息以恢复原始数据
  fetchUserInfo()
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

onMounted(() => {
  fetchUserInfo()
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
</style> 