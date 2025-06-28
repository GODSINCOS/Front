<template>
  <el-card>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="会议名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入会议名称" />
      </el-form-item>
      <el-form-item label="会议时间" prop="time">
        <el-date-picker
          v-model="form.time"
          type="datetimerange"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          range-separator="至"
          format="YYYY-MM-DD HH:mm"
        />
      </el-form-item>
      <el-form-item label="创建人" prop="creator">
        <el-input v-model="form.creator" placeholder="请输入创建人" />
      </el-form-item>
      <el-form-item label="会议内容" prop="content">
        <el-input type="textarea" v-model="form.content" :rows="6" placeholder="请输入会议内容" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
        <el-button @click="goBack">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMeetingDetail, editMeeting } from '@/api/meeting'

const route = useRoute()
const router = useRouter()
const form = ref({
  name: '',
  time: [],
  creator: '',
  content: ''
})
const rules = {
  name: [{ required: true, message: '请输入会议名称' }],
  time: [{ required: true, message: '请选择会议时间' }],
  creator: [{ required: true, message: '请输入创建人' }],
  content: [{ required: true, message: '请输入会议内容' }]
}
const formRef = ref(null)
const fetchDetail = async () => {
  const res = await getMeetingDetail(route.params.id)
  form.value = {
    ...res.data,
    time: [res.data.startTime, res.data.endTime]
  }
}
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      const [startTime, endTime] = form.value.time
      const res = await editMeeting({ ...form.value, startTime, endTime, id: route.params.id })
      if (res.data.success) {
        ElMessage.success('保存成功')
        router.push('/meeting/list')
      } else {
        ElMessage.error('保存失败')
      }
    }
  })
}
const goBack = () => {
  router.push('/meeting/list')
}
onMounted(fetchDetail)
</script> 