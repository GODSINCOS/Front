<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>新增新闻</span>
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
          action="/api/upload"
          :show-file-list="false"
          :on-success="handleUploadSuccess"
          :before-upload="beforeUpload"
        >
          <img v-if="form.imageUrl" :src="form.imageUrl" class="uploaded-img" />
          <el-button v-else type="primary">上传图片</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item label="新闻内容" prop="content">
        <el-input type="textarea" v-model="form.content" rows="8" placeholder="请输入新闻内容" />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSubmit">提交</el-button>
        <el-button @click="goBack">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { addNewsItem } from '@/api/news'

const router = useRouter()

const form = ref({
  title: '',
  summary: '',
  author: '',
  imageUrl: '',
  content: ''
})

const rules = {
  title: [{ required: true, message: '请输入标题' }],
  summary: [{ required: true, message: '请输入简介' }],
  author: [{ required: true, message: '请输入作者' }],
  imageUrl: [{ required: true, message: '请上传图片' }],
  content: [{ required: true, message: '请输入内容' }]
}

const formRef = ref(null)
const loading = ref(false)

const handleUploadSuccess = (response) => {
  form.value.imageUrl = response.url
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
      loading.value = true
      try {
        const res = await addNewsItem(form.value)
        if (res.success) {
          ElMessage.success('创建成功')
          router.push('/dashboard/dynamics')
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
  router.push('/dashboard/dynamics')
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
