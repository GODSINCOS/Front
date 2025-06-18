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
        v-if="news.imageUrl"
        :src="news.imageUrl"
        style="max-width: 300px"
        :preview-src-list="[news.imageUrl]"
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
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getNewsDetail } from '@/api/news'

const route = useRoute()
const router = useRouter()
const news = ref({})

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
  router.push('/dashboard/dynamics')
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
