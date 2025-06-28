<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>发布动态</span>
        <el-button @click="goBack" type="primary" plain>返回列表</el-button>
      </div>
    </template>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="新闻标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入新闻标题" />
      </el-form-item>
      <el-form-item label="新闻简介" prop="summary">
        <el-input v-model="form.summary" placeholder="请输入新闻简介" />
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input v-model="form.author" placeholder="请输入作者" />
      </el-form-item>
      <el-form-item label="新闻图片" prop="imageUrl">
        <el-upload
          :show-file-list="false"
          :before-upload="beforeUpload"
          :on-change="handleImageChange"
          :auto-upload="false"
        >
          <img v-if="imagePreviewUrl" :src="imagePreviewUrl" class="uploaded-img" />
          <el-button v-else type="primary">上传图片</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item label="新闻内容" prop="content">
        <el-input type="textarea" v-model="form.content" rows="8" placeholder="请输入新闻内容" />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSubmit">发布</el-button>
        <el-button @click="goBack">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { addNewsItem, uploadNewsImage, getNewsImageUrl } from '@/api/news'

const router = useRouter()

const form = ref({
  title: '',
  summary: '',
  author: '',
  content: ''
})

const rules = {
  title: [{ required: true, message: '请输入标题' }],
  summary: [{ required: true, message: '请输入简介' }],
  author: [{ required: true, message: '请输入作者' }],
  content: [{ required: true, message: '请输入内容' }]
}

const formRef = ref(null)
const loading = ref(false)
const imageFile = ref(null)
const imagePreviewUrl = ref('')

const getToken = () => (typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('token') : '')

const handleImageChange = (file) => {
  imageFile.value = file.raw
  imagePreviewUrl.value = URL.createObjectURL(file.raw)
}

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isJpgOrPng) ElMessage.error('只能上传jpg/png图片')
  if (!isLt2M) ElMessage.error('图片大小不能超过2MB')
  return isJpgOrPng && isLt2M
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      if (!imageFile.value) {
        ElMessage.error('请上传图片')
        return
      }
      loading.value = true
      try {
        const res = await addNewsItem({
          ...form.value
        })
        if (res.success) {
          // 上传图片
          if (imageFile.value) {
            await uploadNewsImage(res.data.id, imageFile.value)
          }
          ElMessage.success('创建成功')
          router.push('/system/dynamics')
        } else {
          ElMessage.error(`创建失败：${res.message}`)
        }
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('提交失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}

const goBack = () => {
  router.push('/system/dynamics')
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-form {
  max-width: 800px;
  margin: 0 auto;
}

.el-form-item {
  margin-bottom: 20px;
}

.uploaded-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-bottom: 10px;
}
</style>
