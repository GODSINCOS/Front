<template>
  <el-card>
    <div class="mb-3">
      <el-button type="primary" @click="handleAdd">发布动态</el-button>
    </div>
    <el-table :data="newsList" border style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="author" label="作者" />
      <el-table-column prop="summary" label="简介" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.status === 0" type="info">待审核</el-tag>
          <el-tag v-else-if="row.status === 1" type="success">已通过</el-tag>
          <el-tag v-else type="danger">已拒绝</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="viewDetail(row.id)">查看</el-button>
          <el-button size="small" type="success" @click="editItem(row.id)">编辑</el-button>
          <el-button size="small" type="danger" @click="confirmDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchNewsList, deleteNewsItem } from '@/api/news'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const newsList = ref([])
const selectedRows = ref([])
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const fetchList = async () => {
  await userStore.fetchUserInfo()
  const params = {
    userId: userStore.userInfo.user.id,
    page: pagination.value.page,
    size: pagination.value.pageSize
  }
  const res = await fetchNewsList(params)
  newsList.value = res.data.list || []
  pagination.value.total = res.data.total || 0
}

const handleAdd = () => router.push('/system/dynamics/add')
const viewDetail = (id) => router.push(`/system/dynamics/detail/${id}`)
const editItem = (id) => router.push(`/system/dynamics/edit/${id}`)
const confirmDelete = (id) => {
  ElMessageBox.confirm('是否确认删除该动态？', '提示', {
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
onMounted(fetchList)
</script>

<style scoped>
.el-form-item {
  margin-bottom: 16px;
}
</style> 