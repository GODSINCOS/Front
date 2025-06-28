<template>
  <el-card>
    <!-- 🔍 搜索条件区域 -->
    <el-form :inline="true" :model="searchForm" class="mb-3">
      <el-form-item label="新闻标题">
        <el-input v-model="searchForm.title" placeholder="请输入新闻标题" />
      </el-form-item>
      <el-form-item label="新闻简介">
        <el-input v-model="searchForm.summary" placeholder="请输入新闻简介" />
      </el-form-item>
      <el-form-item label="作者">
        <el-input v-model="searchForm.author" placeholder="请输入作者" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchList">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- ✅ 四个操作按钮区域，放在搜索下方，表格上方 -->
    <el-space class="mb-3">
      <el-button type="primary" plain @click="handleAdd">发布动态</el-button>
      <el-button type="success" plain @click="handleEdit" v-if="isAdmin">修改</el-button>
      <el-button type="danger" plain @click="handleBatchDelete" v-if="isAdmin">删除</el-button>
      <el-button type="warning" plain @click="handleExport">导出</el-button>
      <el-button v-if="!isAdmin" type="info" plain @click="goToMyNews">我的动态管理</el-button>
      <el-button v-if="isAdmin" type="warning" plain @click="goToAudit">审核动态</el-button>
    </el-space>

    <!-- 📋 新闻数据表格 -->
    <el-table
      :data="filteredNewsList"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="title" label="新闻标题" />
      <el-table-column prop="author" label="作者" />
      <el-table-column prop="summary" label="新闻简介" />
      <el-table-column prop="createTime" label="创建时间">
        <template #default="{ row }">
          {{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="viewDetail(row.id)">查看</el-button>
          <el-button
            size="small"
            type="success"
            @click="editItem(row.id)"
            v-if="isAdmin"
          >编辑</el-button>
          <el-button
            size="small"
            type="danger"
            @click="confirmDelete(row.id)"
            v-if="isAdmin"
          >删除</el-button>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" width="100">
        <template #default="{ row }">
          <span v-if="row.status === 1">已通过</span>
          <span v-else-if="row.status === 0">待审核</span>
          <span v-else-if="row.status === 2">已拒绝</span>
          <span v-else>未知</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      class="mt-4"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.page"
      :page-sizes="[5, 10, 15, 20, 25]"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </el-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { fetchNewsList, deleteNewsItem, exportNews, auditNewsItem } from '@/api/news'
import { useUserStore } from '@/stores/user'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()
const isAdmin = computed(() => userStore.userInfo && userStore.userInfo.roles && userStore.userInfo.roles.includes('ROLE_ADMIN'))
const currentUserId = computed(() => userStore.userInfo && userStore.userInfo.user && userStore.userInfo.user.id)

// 搜索表单
const searchForm = ref({
  title: '',
  summary: '',
  author: ''
})

// 数据与分页
const newsList = ref([])
const selectedRows = ref([])
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 拉取数据
const fetchList = async () => {
  try {
    await userStore.fetchUserInfo()
    const params = {
      ...searchForm.value,
      page: pagination.value.page,
      size: pagination.value.pageSize
    }
    const res = await fetchNewsList(params)
    newsList.value = res.data.list || []
    pagination.value.total = res.data.total || 0
  } catch (error) {
    console.error('获取新闻列表失败:', error)
    newsList.value = []
    pagination.value.total = 0
    if (error.response && error.response.status === 403) {
      ElMessage.error('无权限访问该内容')
    } else {
      ElMessage.error('获取数据失败，请检查网络连接')
    }
  }
  console.log('当前用户信息', userStore.userInfo)
  console.log('当前用户角色', userStore.userInfo && userStore.userInfo.roles)
}

// 操作事件
const handleAdd = () => router.push('/system/dynamics/add')
const handleEdit = () => {
  if (selectedRows.value.length !== 1) {
    ElMessage.warning('请选中一条新闻进行编辑')
    return
  }
  router.push(`/system/dynamics/edit/${selectedRows.value[0].id}`)
}
const handleBatchDelete = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请至少选择一条新闻')
    return
  }
  ElMessageBox.confirm(
    `是否确认删除选中的 ${selectedRows.value.length} 条新闻？`,
    '提示',
    { type: 'warning' }
  ).then(async () => {
    let hasError = false
    let errorMsg = ''
    for (const row of selectedRows.value) {
      const res = await deleteNewsItem(row.id)
      if (!res.success) {
        hasError = true
        errorMsg = res.message || '删除失败'
        break
      }
    }
    if (hasError) {
      ElMessageBox.alert(errorMsg, '删除失败', { type: 'error' })
    } else {
      ElMessage.success('删除成功')
    }
    fetchList()
  }).catch(() => {})
}
const handleExport = async () => {
  try {
    ElMessage.info('正在导出数据，请稍候...')
    const response = await exportNews()
    
    // 创建下载链接
    const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `news_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}
const viewDetail = (id) => router.push(`/system/dynamics/detail/${id}`)
const editItem = (id) => router.push(`/system/dynamics/edit/${id}`)
const confirmDelete = (id) => {
  ElMessageBox.confirm('是否确认删除该新闻？', '提示', {
    type: 'warning'
  }).then(async () => {
    const res = await deleteNewsItem(id)
    if (res.success) {
      ElMessage.success('删除成功')
      fetchList()
    } else {
      ElMessageBox.alert(res.message || '删除失败', '删除失败', { type: 'error' })
    }
  }).catch(() => {})
}
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}
const handlePageChange = (page) => {
  pagination.value.page = page
  fetchList()
}
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  fetchList()
}
const resetSearch = () => {
  searchForm.value = {
    title: '',
    summary: '',
    author: ''
  }
  pagination.value.page = 1
  fetchList()
}
const goBack = () => {
  router.push('/system/dynamics')
}
const goToMyNews = () => {
  router.push('/system/my-dynamics')
}
const goToAudit = () => {
  router.push('/system/dynamics/audit')
}

// 审核操作
const handleAudit = async (row, status) => {
  try {
    const res = await auditNewsItem(row.id, status)
    if (res.success) {
      ElMessage.success('审核成功')
      fetchList()
    } else {
      ElMessage.error(res.message || '审核失败')
    }
  } catch (e) {
    ElMessage.error('审核失败')
  }
}

// 只显示已通过的动态
const filteredNewsList = computed(() => newsList.value.filter(item => item.status === 1))

onMounted(fetchList)
</script>

<style scoped>
.el-form-item {
  margin-bottom: 16px;
}
</style>
