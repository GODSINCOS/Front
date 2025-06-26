<template>
  <div class="user-container">
    <div class="header">
      <el-input
        v-model="searchQuery"
        placeholder="请输入用户名/手机号搜索"
        class="search-input"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-button type="primary" @click="handleAdd">新增用户</el-button>
    </div>

    <el-table :data="userList" border style="width: 100%">
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="department" label="部门" />
      <el-table-column prop="role" label="角色" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="primary" link @click="handleChangeStatus(row)">
            {{ row.status === 1 ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="formData.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="formData.department" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-input v-model="formData.role" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getUserList, createUser, updateUser, changeUserStatus } from '@/api/user'
import type { UserInfo, PageParams } from '@/types/user'

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const userList = ref<UserInfo[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

const formData = reactive<UserInfo>({
  id: 0,
  username: '',
  nickname: '',
  phone: '',
  email: '',
  gender: 1,
  status: 1,
  department: '研发部门',
  role: '普通用户',
  avatar: '',
  createTime: '',
  updateTime: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
}

// 获取用户列表
const fetchUserList = async () => {
  try {
    const params: PageParams = {
      page: currentPage.value,
      pageSize: pageSize.value,
      query: searchQuery.value
    }
    const res = await getUserList(params)
    userList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    // 错误处理已在请求拦截器中完成
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchUserList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchUserList()
}

// 新增用户
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  Object.assign(formData, {
    id: 0,
    username: '',
    nickname: '',
    phone: '',
    email: '',
    gender: 1,
    status: 1,
    department: '研发部门',
    role: '普通用户',
    avatar: '',
    createTime: '',
    updateTime: ''
  })
}

// 编辑用户
const handleEdit = (row: UserInfo) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(formData, row)
}

// 修改用户状态
const handleChangeStatus = async (row: UserInfo) => {
  try {
    await ElMessageBox.confirm(
      `确认要${row.status === 1 ? '禁用' : '启用'}该用户吗？`,
      '提示'
    )
    await changeUserStatus(row.id, row.status === 1 ? 0 : 1)
    ElMessage.success('操作成功')
    fetchUserList()
  } catch (error) {
    // 用户取消操作或错误处理已在请求拦截器中完成
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          await createUser(formData)
          ElMessage.success('新增成功')
        } else {
          await updateUser(formData.id, formData)
          ElMessage.success('编辑成功')
        }
        dialogVisible.value = false
        fetchUserList()
      } catch (error) {
        // 错误处理已在请求拦截器中完成
      }
    }
  })
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 