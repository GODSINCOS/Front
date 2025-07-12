<template>
  <div class="user-management-container">
    <!-- 查询条件 -->
    <div class="search-panel">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="用户名称">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入手机号码"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="所属企业">
          <el-input
            v-model="searchForm.enterpriseName"
            placeholder="请输入企业名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.createTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        增加
      </el-button>
      <el-button type="success" @click="handleBatchEnable" :disabled="!selectedUsers.length">
        <el-icon><Check /></el-icon>
        批量启用
      </el-button>
      <el-button type="warning" @click="handleBatchDisable" :disabled="!selectedUsers.length">
        <el-icon><Close /></el-icon>
        批量禁用
      </el-button>
      <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedUsers.length">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
    </div>

    <!-- 用户表格 -->
    <div class="table-container">
      <el-table
        :data="userList"
        border
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="username" label="用户名称" width="120" />
        <el-table-column prop="nickname" label="用户昵称" width="120" />
        <el-table-column prop="phone" label="手机号码" width="130" />
        <el-table-column prop="email" label="邮箱地址" width="180" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            <span>{{ row.gender === '男' ? '男' : row.gender === '女' ? '女' : '未设置' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="enterpriseName" label="所属企业" width="150">
          <template #default="{ row }">
            <span>{{ row.enterpriseName || '未设置' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              修改
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              <el-icon><Switch /></el-icon>
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 用户表单弹窗 -->
    <user-form
      v-model:visible="dialogVisible"
      :type="dialogType"
      :data="formData"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  Search,
  Refresh,
  Plus,
  Check,
  Close,
  Delete,
  Edit,
  Switch
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, createUser, updateUser, changeUserStatus, deleteUser, batchDeleteUsers, batchChangeUserStatus } from '@/api/user'
import type { UserInfo } from '@/types/user'
import UserForm from './UserForm.vue'

// 搜索表单
const searchForm = reactive({
  username: '',
  phone: '',
  enterpriseName: '',
  status: '',
  createTime: null as any
})

// 用户列表相关
const userList = ref<UserInfo[]>([])
const selectedUsers = ref<UserInfo[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formData = ref<Partial<UserInfo>>({})

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      username: searchForm.username || undefined,
      phone: searchForm.phone || undefined,
      enterpriseName: searchForm.enterpriseName || undefined,
      status: searchForm.status !== '' ? Number(searchForm.status) : undefined
    }
    
    const res = await getUserList(params)
    userList.value = res.data.list || []
    pagination.total = res.data.total || 0
    
    // 调试：检查用户数据格式
    console.log('用户列表数据:', userList.value.slice(0, 2)) // 只显示前两个用户数据
    
    // 格式化时间
    userList.value.forEach(user => {
      if (user.createTime) {
        user.createTime = formatDate(user.createTime)
      }
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 搜索用户
const handleSearch = () => {
  pagination.currentPage = 1
  fetchUserList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    phone: '',
    enterpriseName: '',
    status: '',
    createTime: null
  })
  pagination.currentPage = 1
  fetchUserList()
}

// 新增用户
const handleAdd = () => {
  dialogType.value = 'add'
  formData.value = {}
  dialogVisible.value = true
}

// 修改用户
const handleEdit = (row: UserInfo) => {
  console.log('编辑用户原始数据:', row)
  console.log('用户ID:', row.id, '类型:', typeof row.id)
  dialogType.value = 'edit'
  formData.value = { ...row }
  dialogVisible.value = true
}

// 删除用户
const handleDelete = async (row: UserInfo) => {
  try {
    await ElMessageBox.confirm(
      `确认要删除用户"${row.username}"吗？删除后无法恢复！`,
      '删除确认',
      {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }
    )
    
    await deleteUser(Number(row.id))
    ElMessage.success('删除成功')
    fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 切换用户状态
const handleToggleStatus = async (row: UserInfo) => {
  try {
    const action = row.status === 1 ? '禁用' : '启用'
    await ElMessageBox.confirm(
      `确认要${action}用户"${row.username}"吗？`,
      '状态确认',
      {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }
    )
    
    await changeUserStatus(Number(row.id), row.status === 1 ? 0 : 1)
    ElMessage.success(`${action}成功`)
    fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 表格选择变化
const handleSelectionChange = (selection: UserInfo[]) => {
  selectedUsers.value = selection
}

// 批量启用
const handleBatchEnable = async () => {
  try {
    await ElMessageBox.confirm(
      `确认要启用选中的 ${selectedUsers.value.length} 个用户吗？`,
      '批量启用确认',
      {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }
    )
    
    const userIds = selectedUsers.value.map(user => Number(user.id))
    console.log('批量启用用户IDs:', userIds)
    await batchChangeUserStatus(userIds, 1)
    ElMessage.success('批量启用成功')
    fetchUserList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量启用失败:', error)
      const message = error?.response?.data?.message || error?.message || '批量启用失败'
      ElMessage.error(message)
    }
  }
}

// 批量禁用
const handleBatchDisable = async () => {
  try {
    await ElMessageBox.confirm(
      `确认要禁用选中的 ${selectedUsers.value.length} 个用户吗？`,
      '批量禁用确认',
      {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }
    )
    
    const userIds = selectedUsers.value.map(user => Number(user.id))
    console.log('批量禁用用户IDs:', userIds)
    await batchChangeUserStatus(userIds, 0)
    ElMessage.success('批量禁用成功')
    fetchUserList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量禁用失败:', error)
      const message = error?.response?.data?.message || error?.message || '批量禁用失败'
      ElMessage.error(message)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确认要删除选中的 ${selectedUsers.value.length} 个用户吗？删除后无法恢复！`,
      '批量删除确认',
      {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'error'
      }
    )
    
    const userIds = selectedUsers.value.map(user => Number(user.id))
    console.log('批量删除用户IDs:', userIds)
    await batchDeleteUsers(userIds)
    ElMessage.success('批量删除成功')
    fetchUserList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      const message = error?.response?.data?.message || error?.message || '批量删除失败'
      ElMessage.error(message)
    }
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.currentPage = 1
  fetchUserList()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchUserList()
}

// 表单提交成功
const handleFormSuccess = () => {
  dialogVisible.value = false
  fetchUserList()
}

// 初始化
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-management-container {
  background: #f5f7fa;
  padding: 16px;
  min-height: calc(100vh - 120px);
}

.search-panel {
  padding: 20px;
  margin-bottom: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-form {
  margin: 0;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.toolbar {
  padding: 16px 20px;
  margin-bottom: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 12px;
}

.table-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.pagination-container {
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 8px 0;
}

:deep(.el-button--text) {
  padding: 4px 8px;
}
</style> 