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
        <el-form-item label="图片路径" prop="imageUrl">
          <el-input v-model="form.imageUrl" />
        </el-form-item>
        <el-form-item label="新闻内容" prop="content">
          <el-input type="textarea" v-model="form.content" rows="8" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
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
  imageUrl: [{ required: true, message: '请输入图片路径' }],
  content: [{ required: true, message: '请输入内容' }]
}

const formRef = ref(null)

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

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
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
      }
    }
  })
}

const goBack = () => {
  router.push('/dashboard/dynamics')
}

onMounted(fetchDetail)
</script>
