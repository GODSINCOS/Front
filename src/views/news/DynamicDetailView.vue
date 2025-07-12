<template>
  <el-card>
    <el-page-header @back="goBack" content="新闻详情" class="mb-4" />

    <el-descriptions title="基本信息" :column="2" border>
      <el-descriptions-item label="标题">{{ news.title }}</el-descriptions-item>
      <el-descriptions-item label="作者">{{ news.author }}</el-descriptions-item>
      <el-descriptions-item label="发布时间">{{ news.createTime }}</el-descriptions-item>
      <el-descriptions-item label="简介">{{ news.summary }}</el-descriptions-item>
    </el-descriptions>

    <div class="mt-4">
      <h4>新闻封面图：</h4>
      <el-image
        v-if="news.id"
        :src="getNewsImageUrl(news.id)"
        style="max-width: 300px"
        :preview-src-list="[getNewsImageUrl(news.id)]"
      />
      <p v-else class="text-gray-500">暂无图片</p>
    </div>

    <div class="mt-4">
      <h4>新闻内容：</h4>
      <div
        class="rich-text-content"
        v-html="news.content"
      />
    </div>
    <div class="mt-4" v-if="isAdmin">
      <el-button type="success" @click="editNews">编辑</el-button>
      <el-button type="danger" @click="confirmDelete">删除</el-button>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getNewsDetail, deleteNewsItem, getNewsImageUrl } from '@/api/news'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const news = ref({})
const userStore = useUserStore()
const isAdmin = userStore.userInfo && userStore.userInfo.roles && userStore.userInfo.roles.includes('ROLE_ADMIN')

// 获取新闻 ID
const id = route.params.id

const fetchDetail = async () => {
  try {
    const res = await getNewsDetail(id)
    if (res.success) {
      news.value = res.data
    }
  } catch (error) {
    console.error('获取新闻详情失败:', error)
  }
}

const goBack = () => {
  // 返回到新闻列表页面
  router.push('/system/dynamics')
}

const editNews = () => {
  router.push(`/system/dynamics/edit/${id}`)
}

const confirmDelete = () => {
  ElMessageBox.confirm('是否确认删除该新闻？', '提示', {
    type: 'warning'
  }).then(async () => {
    const res = await deleteNewsItem(id)
    if (res.success) {
      ElMessage.success('删除成功')
      router.push('/system/dynamics')
    } else {
      ElMessageBox.alert(res.message || '删除失败', '删除失败', { type: 'error' })
    }
  }).catch(() => {})
}

onMounted(fetchDetail)
</script>

<style scoped>
.rich-text-content {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #f9f9f9;
  line-height: 1.6;
}
</style>
