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

    <el-table :data="userList" border style="width: 100%" v-loading="loading">
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column prop="email" label="邮箱" />
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
      class="pagination"
    />

    <user-form
      v-model:visible="dialogVisible"
      :type="dialogType"
      :data="formData"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, changeUserStatus } from '@/api/user'
import type { UserInfo } from '@/types/user'
import UserForm from './form.vue'

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const userList = ref<UserInfo[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formData = ref<Partial<UserInfo>>({})

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      page: currentPage.value,
      pageSize: pageSize.value,
      query: searchQuery.value
    })
    userList.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
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
  formData.value = {}
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: UserInfo) => {
  dialogType.value = 'edit'
  formData.value = { ...row }
  dialogVisible.value = true
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
  } catch {
    // 用户取消操作
  }
}

// 表单提交成功
const handleSuccess = () => {
  dialogVisible.value = false
  fetchUserList()
}

// 初始化
fetchUserList()
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 