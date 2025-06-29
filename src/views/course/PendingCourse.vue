<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>{{ isAdmin ? '课程审核管理' : '我的课程管理' }}</span>
      </div>
    </template>

    <el-table
      :data="myCourseList"
      border
      style="width: 100%"
    >
      <el-table-column prop="name" label="课程名称" />
      <el-table-column prop="summary" label="课程简介" />
      <el-table-column prop="author" label="课程作者" />
      <el-table-column prop="createTime" label="创建时间">
        <template #default="scope">
          {{ scope.row.createTime ? dayjs(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss') : '暂无' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 1" type="success">已通过</el-tag>
          <el-tag v-else-if="scope.row.status === 0" type="warning">待审核</el-tag>
          <el-tag v-else type="danger">已拒绝</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" :width="220">
        <template #default="{ row }">
          <el-button size="small" type="primary" plain @click="goToDetail(row.id)">查看</el-button>
          <template v-if="isAdmin">
            <el-button size="small" type="success" plain @click="handleApprove(row.id, 1)" v-if="row.status === 0">通过</el-button>
            <el-button size="small" type="danger" plain @click="handleApprove(row.id, 2)" v-if="row.status === 0">拒绝</el-button>
          </template>
          <template v-else>
            <el-button size="small" type="warning" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="handleDeleteCourse(row.id)">删除</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="编辑课程" v-model="editDialogVisible" :close-on-click-modal="false" class="course-dialog">
      <el-form :model="editForm" label-width="100px" class="dialog-form">
        <el-form-item label="课程名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="课程简介">
          <el-input v-model="editForm.summary" type="textarea" />
        </el-form-item>
        <el-form-item label="课程作者">
          <el-input v-model="editForm.author" />
        </el-form-item>
        <el-form-item label="课程排序">
          <el-input v-model.number="editForm.orderNum" type="number" />
        </el-form-item>
        <el-form-item label="课程封面">
          <el-upload 
            :file-list="coverList" 
            :action="uploadUrl" 
            :method="'post'" 
            :limit="1" 
            accept="image/*" 
            list-type="picture-card" 
            :auto-upload="true" 
            :headers="uploadHeaders"
            name="file"
            @success="handleCoverSuccess" 
            @error="handleUploadError"
          />
        </el-form-item>
        <el-form-item label="课程视频">
          <el-upload 
            :file-list="videoList" 
            :action="uploadUrl" 
            :method="'post'" 
            :limit="1" 
            accept="video/mp4,video/avi,video/mov" 
            :auto-upload="true" 
            :headers="uploadHeaders"
            name="file"
            @success="handleVideoSuccess"
            @error="handleUploadError"
          >
            <i class="el-icon-plus"></i>
            <div>上传视频</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="课程内容">
          <el-input v-model="editForm.content" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCourseList, approveCourse, deleteCourse, updateCourse } from '@/api/course'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import type { Course } from '@/types/course'
import { getFullImageUrl } from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const myCourseList = ref<Course[]>([])

const isAdmin = computed(() => {
  // 判断是否为管理员，假设管理员角色为 'ROLE_ADMIN'
  return userStore.userInfo?.roles?.includes('ROLE_ADMIN')
})

const fetchMyCourses = async () => {
  const params: any = {}
  if (isAdmin.value) {
    // 管理员：查看所有待审核的课程
    params.status = 0
    const res = await getCourseList(params)
    myCourseList.value = res.list || []
  } else {
    // 普通用户：分别查待审核和已拒绝课程
    params.userId = userStore.userInfo?.id
    // 查待审核
    params.status = 0
    const res0 = await getCourseList(params)
    // 查已拒绝
    params.status = 2
    const res2 = await getCourseList(params)
    myCourseList.value = [...(res0.list || []), ...(res2.list || [])]
  }
}

const goToDetail = (id: number) => {
  router.push(`/system/course/detail/${id}`)
}

const handleApprove = (id: number, status: number) => {
  const action = status === 1 ? '通过' : '拒绝'
  ElMessageBox.confirm(`确定要${action}该课程吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: status === 1 ? 'success' : 'warning'
  }).then(async () => {
    await approveCourse(id, status)
    ElMessage.success(`${action}成功`)
    fetchMyCourses() // 重新拉取待审核列表
  }).catch(() => {})
}

const editCourse = (id: number) => {
  router.push(`/system/course/edit/${id}`)
}

const handleDeleteCourse = async (id: number) => {
  ElMessageBox.confirm('确定要删除该课程吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteCourse(id)
    ElMessage.success('删除成功')
    fetchMyCourses()
  }).catch(() => {})
}

const editDialogVisible = ref(false)
const editForm = ref<Partial<Course>>({})
const coverList = ref<any[]>([])
const videoList = ref<any[]>([])
const uploadUrl = '/api/upload'
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
}))

const handleCoverSuccess = (res: any) => {
  if (res && res.url) {
    editForm.value.cover = res.url
    coverList.value = [{ name: 'cover.jpg', url: getFullImageUrl(res.url), status: 'success' }]
  }
}
const handleVideoSuccess = (res: any) => {
  if (res && res.url) {
    editForm.value.video = res.url
    videoList.value = [{ name: 'video.mp4', url: getFullImageUrl(res.url), status: 'success' }]
  }
}
const handleUploadError = () => {
  ElMessage.error('上传失败')
}

const openEditDialog = (row: Course) => {
  editForm.value = { ...row }
  editDialogVisible.value = true
  // 确保图片URL是完整路径，file-list结构标准化
  if (row.cover) {
    const coverUrl = getFullImageUrl(row.cover)
    coverList.value = [{
      name: 'cover.jpg',
      url: coverUrl,
      status: 'success',
      response: { url: row.cover }
    }]
  } else {
    coverList.value = []
  }
  // 确保视频URL是完整路径，file-list结构标准化
  if (row.video) {
    const videoUrl = getFullImageUrl(row.video)
    videoList.value = [{
      name: 'video.mp4',
      url: videoUrl,
      status: 'success',
      response: { url: row.video }
    }]
  } else {
    videoList.value = []
  }
}

const submitEdit = async () => {
  // 调用后端接口更新课程
  await updateCourse(editForm.value)
  ElMessage.success('修改成功')
  editDialogVisible.value = false
  fetchMyCourses()
}

onMounted(fetchMyCourses)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-button {
  margin: 0 4px;
}

.course-dialog .el-form-item {
  margin-bottom: 20px;
}

.course-dialog .el-input {
  width: 100%;
}

.course-dialog .el-textarea {
  width: 100%;
}

.course-dialog .el-upload {
  width: 100%;
}

.course-dialog .el-upload .el-upload-dragger {
  width: 100%;
}

.course-dialog .el-upload .el-upload-list {
  width: 100%;
}

.course-dialog .el-upload .el-upload-list .el-upload-list-item {
  width: 100%;
}

.course-dialog .el-upload .el-upload-list .el-upload-list-item .el-upload-list-enter-active {
  transition: all 0.3s ease;
}

.course-dialog .el-upload .el-upload-list .el-upload-list-item .el-upload-list-leave-active {
  transition: all 0.3s ease;
}

.course-dialog .el-upload .el-upload-list .el-upload-list-item .el-upload-list-enter-from {
  opacity: 0;
}

.course-dialog .el-upload .el-upload-list .el-upload-list-item .el-upload-list-enter-to {
  opacity: 1;
}

.course-dialog .el-upload .el-upload-list .el-upload-list-item .el-upload-list-leave-from {
  opacity: 1;
}

.course-dialog .el-upload .el-upload-list .el-upload-list-item .el-upload-list-leave-to {
  opacity: 0;
}

.course-dialog .el-upload .el-upload-list .el-upload-list-item .el-upload-list-item-enter-active {
  transition: all 0.3s ease;
}

.course-dialog .el-upload .el-upload-list .el-upload-list-item .el-upload-list-item-leave-active {
  transition: all 0.3s ease;
}

.course-dialog .el-upload .el-upload-list .el-upload-list-item .el-upload-list-item-enter-from {
  opacity: 0;
}

.course-dialog .el-upload .el-upload-list .el-upload-list-item .el-upload-list-item-enter-to {
  opacity: 1;
}

.course-dialog .el-upload .el-upload-list .el-upload-list-item .el-upload-list-item-leave-from {
  opacity: 1;
}

.course-dialog .el-upload .el-upload-list .el-upload-list-item .el-upload-list-item-leave-to {
  opacity: 0;
}
</style>
