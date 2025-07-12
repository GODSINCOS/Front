<template>
  <el-card>
    <el-page-header @back="goBack" content="课程详情" class="mb-4" />

    <el-descriptions title="基本信息" :column="2" border>
      <el-descriptions-item label="课程名称">{{ course.name || '暂无' }}</el-descriptions-item>
      <el-descriptions-item label="作者">{{ course.author || '暂无' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ course.createTime ? dayjs(course.createTime).format('YYYY-MM-DD HH:mm:ss') : '暂无' }}
      </el-descriptions-item>
      <el-descriptions-item label="课程排序">{{ course.orderNum || '暂无' }}</el-descriptions-item>
      <el-descriptions-item label="课程简介" :span="2">{{ course.summary || '暂无' }}</el-descriptions-item>
    </el-descriptions>

    <div class="mt-4">
      <h4>课程封面：</h4>
      <el-image
        v-if="course.cover"
        :src="getFullUrl(course.cover)"
        style="max-width: 300px"
        :preview-src-list="[getFullUrl(course.cover)]"
      />
      <p v-else class="text-gray-500">暂无图片</p>
    </div>

    <div class="mt-4">
      <h4>课程视频：</h4>
      <video v-if="course.video" :src="getFullUrl(course.video)" controls style="max-width: 400px;" />
      <p v-else class="text-gray-500">暂无视频</p>
    </div>

    <div class="mt-4">
      <h4>课程内容：</h4>
      <div class="rich-text-content" v-if="course.content">
        {{ course.content }}
      </div>
      <p v-else class="text-gray-500">暂无内容</p>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCourseDetail } from '@/api/course'
import { getFullImageUrl } from '@/utils/request'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const course = ref({})
const id = route.params.id

// 拼接完整后端URL
const getFullUrl = (url) => {
  return getFullImageUrl(url)
}

const fetchDetail = async () => {
  try {
    const res = await getCourseDetail(Number(id))
    course.value = res.data || res || {}
  } catch (error) {
    console.error('获取课程详情失败:', error)
  }
}

const goBack = () => {
  router.push('/system/course')
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
  white-space: pre-wrap;
  word-break: break-word;
}

.text-gray-500 {
  color: #6b7280;
}

h4 {
  margin: 16px 0 8px 0;
  color: #374151;
  font-weight: 600;
}
</style>
