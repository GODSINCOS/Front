<template>
  <el-card>
    <el-descriptions title="会议信息" :column="2" border>
      <el-descriptions-item label="会议名称">{{ meeting.name }}</el-descriptions-item>
      <el-descriptions-item label="创建人">{{ meeting.creator }}</el-descriptions-item>
      <el-descriptions-item label="开始时间">{{ meeting.startTime }}</el-descriptions-item>
      <el-descriptions-item label="结束时间">{{ meeting.endTime }}</el-descriptions-item>
      <el-descriptions-item label="会议内容" :span="2">{{ meeting.content }}</el-descriptions-item>
    </el-descriptions>
    <el-button class="mt-3" @click="goBack">返回</el-button>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMeetingDetail } from '@/api/meeting'

const route = useRoute()
const router = useRouter()
const meeting = ref({})

const fetchDetail = async () => {
  const res = await getMeetingDetail(route.params.id)
  meeting.value = res.data
}
const goBack = () => router.push('/meeting/list')
onMounted(fetchDetail)
</script> 