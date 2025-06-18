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
      <el-button type="primary" plain @click="handleAdd">新增</el-button>
      <el-button type="success" plain @click="handleEdit">修改</el-button>
      <el-button type="danger" plain @click="handleBatchDelete">删除</el-button>
      <el-button type="warning" plain @click="handleExport">导出</el-button>
    </el-space>

    <!-- 📋 新闻数据表格 -->
    <el-table
      :data="newsList"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="title" label="新闻标题" />
      <el-table-column prop="author" label="作者" />
      <el-table-column prop="summary" label="新闻简介" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="viewDetail(row.id)">查看</el-button>
          <el-button size="small" type="success" @click="editItem(row.id)">编辑</el-button>
          <el-button size="small" type="danger" @click="confirmDelete(row.id)">删除</el-button>
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
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { fetchNewsList, deleteNewsItem } from '@/api/news'

const router = useRouter()

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
    // 如果 API 失败，显示空列表而不是空白页面
    newsList.value = []
    pagination.value.total = 0
    ElMessage.error('获取数据失败，请检查网络连接')
  }
}

// 操作事件
const handleAdd = () => router.push('/dashboard/dynamics/add')
const handleEdit = () => {
  if (selectedRows.value.length !== 1) {
    ElMessage.warning('请选中一条新闻进行编辑')
    return
  }
  router.push(`/dashboard/dynamics/edit/${selectedRows.value[0].id}`)
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
    for (const row of selectedRows.value) {
      await deleteNewsItem(row.id)
    }
    ElMessage.success('删除成功')
    fetchList()
  }).catch(() => {})
}
const handleExport = () => {
  ElMessage.info('导出功能待实现')
}
const viewDetail = (id) => router.push(`/dashboard/dynamics/detail/${id}`)
const editItem = (id) => router.push(`/dashboard/dynamics/edit/${id}`)
const confirmDelete = (id) => {
  ElMessageBox.confirm('是否确认删除该新闻？', '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteNewsItem(id)
    ElMessage.success('删除成功')
    fetchList()
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

onMounted(fetchList)
</script>

<style scoped>
.el-form-item {
  margin-bottom: 16px;
}
</style>
