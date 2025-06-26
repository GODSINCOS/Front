<template>
  <el-card>
    <el-table :data="newsList" border style="width: 100%">
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="author" label="作者" />
      <el-table-column prop="summary" label="简介" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="viewDetail(row.id)">查看</el-button>
          <el-button size="small" type="success" @click="handleAudit(row, 1)">通过</el-button>
          <el-button size="small" type="danger" @click="handleAudit(row, 2)">拒绝</el-button>
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
import { ElMessage } from 'element-plus'
import { fetchPendingNewsList, auditNewsItem } from '@/api/news'

const router = useRouter()
const newsList = ref([])
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const fetchList = async () => {
  const res = await fetchPendingNewsList()
  newsList.value = res.data || []
  pagination.value.total = newsList.value.length
}

const viewDetail = (id) => router.push(`/system/dynamics/detail/${id}`)
const handleAudit = async (row, status) => {
  const res = await auditNewsItem(row.id, status)
  if (res.success) {
    ElMessage.success('审核成功')
    fetchList()
  } else {
    ElMessage.error(res.message || '审核失败')
  }
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
</style> 