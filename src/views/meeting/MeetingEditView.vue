<template>
  <el-card>
    <!-- 普通用户编辑提示 -->
    <el-alert
      v-if="!isAdmin"
      title="编辑提醒"
      description="您编辑会议后，会议将重新进入待审核状态，需要管理员重新审核通过后才能生效。"
      type="info"
      :closable="false"
      style="margin-bottom: 20px;"
    />
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMeetingDetail, editMeeting } from '@/api/meeting.js'
import { useUserStore } from '@/stores/user'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 判断是否是管理员
const isAdmin = computed(() =>
  (userStore.userInfo?.roles || []).some(role =>
    role === 'admin' || role === 'ROLE_ADMIN'
  )
)

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
  try {
    const res = await getMeetingDetail(route.params.id)
    const meetingData = res.data || res
    form.value = {
      name: meetingData.name || '',
      creator: meetingData.creator || '',
      content: meetingData.content || '',
      time: [
        meetingData.startTime ? dayjs(meetingData.startTime).toDate() : null,
        meetingData.endTime ? dayjs(meetingData.endTime).toDate() : null
      ]
    }
  } catch (error) {
    console.error('获取会议详情失败:', error)
    ElMessage.error('获取会议详情失败')
    router.push('/system/meeting')
  }
}
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const [startTime, endTime] = form.value.time
        // 准备提交的数据，格式化时间
        const submitData = {
          name: form.value.name,
          startTime: startTime ? dayjs(startTime).format('YYYY-MM-DD HH:mm:ss') : null,
          endTime: endTime ? dayjs(endTime).format('YYYY-MM-DD HH:mm:ss') : null,
          creator: form.value.creator,
          content: form.value.content
        }
        
        // 调用API，ID作为路径参数，数据作为请求体
        const res = await editMeeting(route.params.id, submitData)
        
        if (res && res.success !== false) {
          if (isAdmin.value) {
            ElMessage.success('会议编辑成功')
          } else {
            ElMessage.success('会议编辑成功，已提交重新审核')
          }
          router.push('/system/meeting')
        } else {
          ElMessage.error(res?.message || '保存失败')
        }
      } catch (error) {
        console.error('编辑会议失败:', error)
        ElMessage.error(error?.message || '保存失败，请检查网络连接')
      }
    }
  })
}
const goBack = () => {
  router.push('/system/meeting')
}
onMounted(fetchDetail)
</script> 