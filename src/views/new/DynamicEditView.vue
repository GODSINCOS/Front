<template>
  <el-card>
    <el-dialog
      v-model="dialogVisible"
      title="编辑新闻"
      width="60%"
      :close-on-click-modal="false"
      @close="goBack"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="新闻标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="新闻简介" prop="summary">
          <el-input v-model="form.summary" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" />
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
      </el-form>

      <template #footer>
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getNewsDetail, editNewsItem } from '@/api/news'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const dialogVisible = ref(true)

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

const fetchDetail = async () => {
  try {
    const res = await getNewsDetail(id)
    if (res.success) {
      form.value = res.data
    }
  } catch (error) {
    console.error('获取新闻详情失败:', error)
    ElMessage.error('获取新闻详情失败')
  }
}

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
        const res = await editNewsItem(id, form.value)
        if (res.success) {
          ElMessage.success('修改成功')
          router.push('/dashboard/dynamics')
        } else {
          ElMessage.error(`修改失败：${res.message}`)
        }
      } catch (error) {
        console.error('修改失败:', error)
        ElMessage.error('修改失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const goBack = () => {
  router.push('/dashboard/dynamics')
}

onMounted(fetchDetail)
</script>

<style scoped>
.uploaded-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-bottom: 10px;
}
</style>
