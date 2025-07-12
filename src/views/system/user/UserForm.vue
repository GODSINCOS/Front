<template>
  <el-dialog
    :title="type === 'add' ? '新增用户' : '修改用户'"
    v-model="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用户昵称" prop="nickname">
            <el-input v-model="formData.nickname" placeholder="请输入用户昵称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户名称" prop="username">
            <el-input 
              v-model="formData.username" 
              placeholder="请输入用户名称"
              :disabled="type === 'edit'" 
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="手机号码" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入手机号码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱地址" prop="email">
            <el-input v-model="formData.email" placeholder="请输入邮箱地址" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="formData.gender">
              <el-radio :value="'男'">男</el-radio>
              <el-radio :value="'女'">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio :value="1">正常</el-radio>
              <el-radio :value="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

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

      <el-form-item label="用户头像">
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
            <el-button type="primary" size="small">
              选择头像
            </el-button>
          </el-upload>
        </div>
      </el-form-item>

      <el-form-item v-if="type === 'add'" label="用户密码" prop="password">
        <el-input 
          v-model="formData.password" 
          type="password" 
          show-password 
          placeholder="请输入用户密码"
        />
      </el-form-item>


    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadFile, UploadRawFile } from 'element-plus'
import { createUser, updateUser } from '@/api/user'
import type { UserInfo } from '@/types/user'
import { getEnterpriseList, getPublicEnterpriseList, type Enterprise } from '@/api/enterprise'

const props = defineProps<{
  visible: boolean
  type: 'add' | 'edit'
  data: Partial<UserInfo>
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const uploadRef = ref()
const loading = ref(false)
const enterpriseList = ref<Enterprise[]>([])
const avatarPreview = ref('')
const avatarFile = ref<File | null>(null)

// 表单数据初始化
const initFormData = () => ({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  gender: '男' as string,
  enterpriseId: null as number | null,
  status: 1 as number,
  password: ''
})

const formData = reactive<Partial<UserInfo> & { password?: string }>(initFormData())

// 表单验证规则
const rules: FormRules = {
  nickname: [
    { required: true, message: '用户昵称不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '用户昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '用户名称不能为空', trigger: 'blur' },
    { min: 4, max: 20, message: '用户名称长度在 4 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名称只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '手机号码不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码格式', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址格式', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择用户状态', trigger: 'change' }
  ],
  enterpriseId: [
    { required: true, message: '请选择所属企业', trigger: 'change' }
  ],
  password: [
    { required: true, message: '用户密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const dialogVisible = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val)
})

// 监听数据变化，填充表单
watch(
  () => props.data,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      Object.assign(formData, val)
      // 如果有头像数据，设置预览
      if (val.avatar) {
        avatarPreview.value = `data:image/jpeg;base64,${val.avatar}`
      } else {
        avatarPreview.value = ''
      }
    } else {
      // 新增时重置为默认值
      Object.assign(formData, initFormData())
      avatarPreview.value = ''
      avatarFile.value = null
    }
  },
  { immediate: true, deep: true }
)

// 监听弹窗显示状态
watch(
  () => props.visible,
  (val) => {
    if (val) {
      nextTick(() => {
        // 弹窗打开时，如果是新增模式，重置表单并设置默认值
        if (props.type === 'add') {
          Object.assign(formData, initFormData())
          avatarPreview.value = ''
          avatarFile.value = null
        }
      })
    }
  }
)

// 获取企业列表
const fetchEnterpriseList = async () => {
  try {
    // 优先使用公共API，如果失败则尝试管理API
    let res
    try {
      res = await getPublicEnterpriseList()
    } catch (publicError) {
      console.log('公共企业列表API失败，尝试管理API:', publicError)
      res = await getEnterpriseList()
    }
    enterpriseList.value = res.data || []
  } catch (error) {
    console.error('获取企业列表失败:', error)
    ElMessage.error('获取企业列表失败，请重试')
  }
}

// 页面初始化
onMounted(() => {
  fetchEnterpriseList()
})

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
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true
    
    let submitData: any = {}
    
    // 只提取需要的字段
    if (props.type === 'add') {
      // 新增用户需要的字段（不包含remark，因为后端User实体没有remark字段）
      submitData = {
        username: formData.username,
        nickname: formData.nickname,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        enterpriseId: formData.enterpriseId,
        status: formData.status,
        password: formData.password
      }
    } else {
      // 编辑用户需要的字段（不包含password和remark，因为后端User实体没有remark字段）
      submitData = {
        username: formData.username,
        nickname: formData.nickname,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        enterpriseId: formData.enterpriseId,
        status: formData.status
      }
    }

    // 如果有头像文件，转换为Base64
    if (avatarFile.value) {
      const avatarBase64 = await fileToBase64(avatarFile.value)
      submitData.avatar = avatarBase64
    }

    console.log('提交的数据:', JSON.stringify(submitData, null, 2))

    if (props.type === 'add') {
      await createUser(submitData)
      ElMessage.success('用户创建成功')
    } else {
      // 确保ID是正确的数字格式
      const userId = String(formData.id!).split(':')[0] // 如果ID包含冒号，只取第一部分
      console.log('修改用户ID:', userId, '原始ID:', formData.id)
      console.log('修改用户提交数据:', JSON.stringify(submitData, null, 2))
      await updateUser(Number(userId), submitData)
      ElMessage.success('用户修改成功')
    }
    
    emit('success')
  } catch (error: any) {
    console.error('操作失败:', error)
    const message = error?.response?.data?.message || error?.message || '操作失败'
    ElMessage.error(`${props.type === 'add' ? '创建' : '修改'}失败：${message}`)
  } finally {
    loading.value = false
  }
}

// 取消操作
const handleCancel = () => {
  dialogVisible.value = false
}

// 关闭时重置表单
const handleClosed = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  // 重置为初始值
  Object.assign(formData, initFormData())
  // 重置头像相关数据
  avatarPreview.value = ''
  avatarFile.value = null
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__inner) {
  border-radius: 4px;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 16px;
}

:deep(.el-textarea__inner) {
  border-radius: 4px;
}

/* 头像上传样式 */
.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.avatar-label {
  font-size: 12px;
  color: #909399;
  text-align: center;
}

:deep(.el-avatar) {
  border: 2px solid #e4e7ed;
  transition: border-color 0.3s ease;
}

:deep(.el-avatar:hover) {
  border-color: #409eff;
}
</style> 