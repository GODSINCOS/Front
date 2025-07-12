<template>
  <el-card>
    <h2>会议审核</h2>
    <el-table :data="meetings" style="width: 100%">
      <el-table-column prop="name" label="会议名称" />
      <el-table-column prop="creator" label="创建人" />
      <el-table-column prop="startTime" label="开始时间" />
      <el-table-column prop="endTime" label="结束时间" />
      <el-table-column prop="content" label="会议内容" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="success" size="small" @click="handleAudit(scope.row.id, 1)">通过</el-button>
          <el-button type="danger" size="small" @click="handleAudit(scope.row.id, 2)">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchPendingMeetings, auditMeeting } from '@/api/meeting.js'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const meetings = ref([])
const route = useRoute()
const router = useRouter()
const auditId = computed(() => route.query.id)
const userStore = useUserStore()

const loadMeetings = async () => {
  const res = await fetchPendingMeetings()
  if (res && res.success) {
    if (auditId.value) {
      meetings.value = res.data.filter(m => String(m.id) === String(auditId.value))
    } else {
      meetings.value = res.data
    }
  } else {
    meetings.value = []
  }
}

const handleAudit = async (id, status) => {
  const res = await auditMeeting(id, status)
  if (res && res.success) {
    ElMessage.success('操作成功')
    if (auditId.value) {
      router.push('/system/meeting')
    } else {
      loadMeetings()
    }
  } else {
    ElMessage.error(res.message || '操作失败')
  }
}

onMounted(() => {
  loadMeetings()
  userStore.fetchUserInfo()
})
</script> 