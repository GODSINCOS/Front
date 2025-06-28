<template>
  <el-card>
    <el-button type="primary" @click="goAdd">新增会议</el-button>
    <el-table :data="meetingList" style="width: 100%" class="mt-3">
      <el-table-column prop="name" label="会议名称" />
      <el-table-column prop="creator" label="创建人" />
      <el-table-column prop="startTime" label="开始时间" />
      <el-table-column prop="endTime" label="结束时间" />
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <div style="display: flex; gap: 8px; align-items: center;">
            <el-button size="small" @click="goDetail(row.id)">详情</el-button>
            <el-button size="small" type="primary" @click="goEdit(row.id)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchMeetingList, deleteMeeting } from '@/api/meeting'

const router = useRouter()
const meetingList = ref([])

const searchForm = ref({
  name: '',
  creator: ''
})

const fetchList = async () => {
  const params = {
    name: searchForm.value.name,
    creator: searchForm.value.creator
  }
  const res = await fetchMeetingList(params)
  if (Array.isArray(res)) {
    meetingList.value = res
  } else if (res && res.data && Array.isArray(res.data.list)) {
    meetingList.value = res.data.list
  } else if (res && Array.isArray(res.list)) {
    meetingList.value = res.list
  } else {
    meetingList.value = []
  }
}
const goAdd = () => router.push('/meeting/add')
const goEdit = (id) => router.push(`/meeting/edit/${id}`)
const goDetail = (id) => router.push(`/meeting/detail/${id}`)
const handleDelete = async (id) => {
  await deleteMeeting(id)
  fetchList()
}
onMounted(fetchList)
</script> 