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
      <el-form-item label="图片路径" prop="imageUrl">
        <el-input v-model="form.imageUrl" placeholder="请输入图片路径" />
      </el-form-item>
      <el-form-item label="新闻内容" prop="content">
        <el-input type="textarea" v-model="form.content" rows="8" placeholder="请输入新闻内容" />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
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
  imageUrl: [{ required: true, message: '请输入图片路径' }],
  content: [{ required: true, message: '请输入内容' }]
}

const formRef = ref(null)

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
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
</style>
