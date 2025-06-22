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

      <el-form-item v-if="type === 'add'" label="用户密码" prop="password">
        <el-input 
          v-model="formData.password" 
          type="password" 
          show-password 
          placeholder="请输入用户密码"
        />
      </el-form-item>

      <el-form-item label="备注信息">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
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
import type { FormInstance, FormRules } from 'element-plus'
import { createUser, updateUser } from '@/api/user'
import type { UserInfo } from '@/types/user'
import { getEnterpriseList, type Enterprise } from '@/api/enterprise'

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
const loading = ref(false)
const enterpriseList = ref<Enterprise[]>([])

// 表单数据初始化
const initFormData = () => ({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  gender: '男' as string,
  enterpriseId: null as number | null,
  status: 1 as number,
  password: '',
  remark: ''
})

const formData = reactive<Partial<UserInfo> & { password?: string; remark?: string }>(initFormData())

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
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/, message: '密码必须包含字母和数字', trigger: 'blur' }
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
    } else {
      // 新增时重置为默认值
      Object.assign(formData, initFormData())
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
        }
      })
    }
  }
)

// 获取企业列表
const fetchEnterpriseList = async () => {
  try {
    const res = await getEnterpriseList()
    enterpriseList.value = res.data || []
  } catch (error) {
    console.error('获取企业列表失败:', error)
  }
}

// 页面初始化
onMounted(() => {
  fetchEnterpriseList()
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true
    
    const submitData = { ...formData }
    
    // 移除不需要的字段
    if (props.type === 'edit') {
      delete submitData.password
    }

    if (props.type === 'add') {
      await createUser(submitData)
      ElMessage.success('用户创建成功')
    } else {
      await updateUser(formData.id!, submitData)
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
</style> 