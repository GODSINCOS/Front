<template>
  <el-card>
    <!-- 搜索栏 -->
    <el-form :inline="true" :model="searchForm" class="mb-3">
      <el-form-item label="课程名称">
        <el-input v-model="searchForm.name" placeholder="请输入课程名称" clearable />
      </el-form-item>
      <el-form-item label="作者">
        <el-input v-model="searchForm.author" placeholder="请输入课者" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain @click="onSearch">搜索</el-button>
        <el-button plain @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮区域 -->
    <el-space class="mb-3">
      <el-button v-if="isEnterprise" type="primary" plain @click="openAddDialog">发布动态</el-button>
      <el-button type="warning" plain @click="exportExcel">导出</el-button>
      <el-button v-if="isEnterprise" type="primary" plain @click="goToPending">我的课程管理</el-button>
      <el-button v-if="isAdmin" type="primary" plain @click="goToPending">审核</el-button>
      <el-button v-if="isAdmin" type="primary" plain @click="openAddDialog">新增</el-button>
      <el-button v-if="isAdmin" type="danger" plain :disabled="!multipleSelection.length" @click="batchDelete">批量删除</el-button>
    </el-space>

    <!-- 数据表格 -->
    <el-table :data="courseList" @selection-change="handleSelectionChange" style="width: 100%" class="course-table" border>
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="课程名称" />
      <el-table-column prop="author" label="课程作者" />
      <el-table-column prop="summary" label="课程简介" />
      <el-table-column prop="createTime" label="创建时间">
        <template #default="scope">
          {{ scope.row.createTime ? dayjs(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss') : '暂无' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="审核状态">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 1" type="success">已通过</el-tag>
          <el-tag v-else-if="scope.row.status === 0" type="warning">待审核</el-tag>
          <el-tag v-else type="danger">已拒绝</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260">
        <template #default="scope">
          <el-button size="small" type="primary" @click="viewDetail(scope.row)">查看</el-button>
          <el-button size="small" type="success" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="confirmDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="mt-4 course-pagination"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.page"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      :page-sizes="[10, 20, 30, 40, 50, 100]"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" :close-on-click-modal="false" class="course-dialog">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="dialog-form">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="课程简介" prop="summary">
          <el-input v-model="form.summary" type="textarea" />
        </el-form-item>
        <el-form-item label="课程作者" prop="author">
          <el-input v-model="form.author" />
        </el-form-item>
        <el-form-item label="课程排序" prop="orderNum">
          <el-input v-model.number="form.orderNum" type="number" />
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
        <el-form-item label="课程视频" prop="video">
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
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false" plain>取消</el-button>
        <el-button type="primary" plain @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 课程详情弹窗 -->
    <el-dialog :title="'课程详情'" v-model="detailDialogVisible" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="课程名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="课程简介">{{ detailData.summary }}</el-descriptions-item>
        <el-descriptions-item label="课程作者">{{ detailData.author }}</el-descriptions-item>
        <el-descriptions-item label="课程排序">{{ detailData.orderNum }}</el-descriptions-item>
        <el-descriptions-item label="课程封面">
          <img v-if="detailData.cover" :src="detailData.cover" style="max-width:100px;" />
          <span v-else>无</span>
        </el-descriptions-item>
        <el-descriptions-item label="课程视频">
          <a v-if="detailData.video" :href="detailData.video" target="_blank">点击查看</a>
          <span v-else>无</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { getCourseList, addCourse, updateCourse, deleteCourse } from '@/api/course';
import type { Course } from '@/types/course';
import * as XLSX from 'xlsx';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user'
import dayjs from 'dayjs'
import { getFullImageUrl } from '@/utils/request'

const searchForm = ref({
  name: '',
  author: ''
});
const courseList = ref<Course[]>([]);
const pagination = reactive({ page: 1, pageSize: 10, total: 0 });
const dialogVisible = ref(false);
const dialogTitle = ref('');
const form = ref<Partial<Course>>({ name: '', summary: '', author: '', orderNum: undefined, cover: '', video: '' });
const multipleSelection = ref<Course[]>([]);
const formRef = ref();
const coverList = ref<any[]>([]);
const videoList = ref<any[]>([]);
const uploadUrl = '/api/upload'; // 需后端支持
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
}));
const detailDialogVisible = ref(false)
const detailData = ref<Partial<Course>>({})
const router = useRouter();
const userStore = useUserStore()
const isAdmin = computed(() => userStore.userInfo?.roles?.includes('ROLE_ADMIN'))
const isEnterprise = computed(() => userStore.userInfo?.roles?.includes('ROLE_ENTERPRISE'))

const rules = {
  name: [{ required: true, message: '课程名称不能为空', trigger: 'blur' }],
  summary: [{ required: true, message: '课程简介不能为空', trigger: 'blur' }],
  author: [{ required: true, message: '课程作者不能为空', trigger: 'blur' }],
  orderNum: [{ required: true, message: '课程排序不能为空', trigger: 'blur' }],
  video: [{ required: true, message: '请上传课程视频', trigger: 'change' }]
};

function fetchList() {
  const params: any = {
    ...searchForm.value,
    page: pagination.page,
    size: pagination.pageSize,
    status: 1 // 只查已通过审核的课程
  }
  
  // 如果不是管理员，只显示自己创建的课程
  if (!isAdmin.value) {
    params.userId = userStore.userInfo?.id
  }
  // 如果是管理员，不添加userId参数，显示所有已通过的课程
  
  getCourseList(params).then((res: any) => {
    courseList.value = res.list || [];
    pagination.total = res.total || 0;
  });
}

function handlePageChange(page: number) {
  pagination.page = page;
  fetchList();
}
function handleSizeChange(size: number) {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchList();
}
function onSearch() {
  pagination.page = 1;
  fetchList();
}
function onReset() {
  searchForm.value.name = '';
  searchForm.value.author = '';
  pagination.page = 1;
  fetchList();
}

function exportExcel() {
  const ws = XLSX.utils.json_to_sheet(courseList.value);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '课程列表');
  XLSX.writeFile(wb, '课程列表.xlsx');
}

function openAddDialog() {
  dialogTitle.value = '新建课程';
  form.value = { name: '', summary: '', author: '', orderNum: undefined, cover: '', video: '' };
  coverList.value = [];
  videoList.value = [];
  dialogVisible.value = true;
}

function openEditDialog(row: Course) {
  dialogTitle.value = '修改课程';
  form.value = { ...row };
  coverList.value = [];
  videoList.value = [];
  // 确保图片URL是完整路径
  if (row.cover) {
    const coverUrl = getFullImageUrl(row.cover)
    coverList.value = [{ name: 'cover.jpg', url: coverUrl, status: 'success' }];
  }
  // 确保视频URL是完整路径
  if (row.video) {
    const videoUrl = getFullImageUrl(row.video)
    videoList.value = [{ name: 'video.mp4', url: videoUrl, status: 'success' }];
  }
  dialogVisible.value = true;
}

function submitForm() {
  formRef.value.validate((valid: boolean) => {
    if (!valid) return;
    if (form.value.id) {
      updateCourse(form.value).then(() => {
        ElMessage.success('修改成功');
        dialogVisible.value = false;
        fetchList();
      }).catch((err: any) => {
        ElMessageBox.alert('修改失败：' + (err?.message || '未知错误'), '错误', { type: 'error', closeOnClickModal: false });
      });
    } else {
      addCourse(form.value).then(() => {
        ElMessage.success('新增成功');
        dialogVisible.value = false;
        fetchList();
      }).catch((err: any) => {
        ElMessageBox.alert('创建失败：' + (err?.message || '未知错误'), '错误', { type: 'error', closeOnClickModal: false });
      });
    }
  });
}

function handleCoverSuccess(res: any, file: any) {
  if (res.success) {
    form.value.cover = res.url;
    ElMessage.success('封面上传成功');
    coverList.value = [{ name: 'cover.jpg', url: getFullImageUrl(res.url), status: 'success' }];
  } else {
    ElMessage.error('封面上传失败：' + (res.message || '未知错误'));
  }
}

function handleVideoSuccess(res: any, file: any) {
  if (res.success) {
    form.value.video = res.url;
    ElMessage.success('视频上传成功');
    videoList.value = [{ name: 'video.mp4', url: getFullImageUrl(res.url), status: 'success' }];
  } else {
    ElMessage.error('视频上传失败：' + (res.message || '未知错误'));
  }
}

function handleUploadError(err: any) {
  console.error('上传失败:', err);
  ElMessage.error('上传失败，请重试');
}

function confirmDelete(id: number) {
  ElMessageBox.confirm('是否确认删除该课程？', '系统提示', {
    confirmButtonText: '是',
    cancelButtonText: '否',
    type: 'warning',
  }).then(() => {
    deleteCourse(id).then(() => {
      ElMessage.success('删除成功');
      fetchList();
    }).catch((err: any) => {
      ElMessageBox.alert('删除失败：' + (err?.message || '未知错误'), '错误', { type: 'error', closeOnClickModal: false });
    });
  });
}

function batchDelete() {
  ElMessageBox.confirm('是否确认批量删除选中的课程？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    Promise.all(multipleSelection.value.map((item: Course) => deleteCourse(item.id!))).then(() => {
      ElMessage.success('批量删除成功');
      fetchList();
    }).catch((err: any) => {
      ElMessageBox.alert('批量删除失败：' + (err?.message || '未知错误'), '错误', { type: 'error', closeOnClickModal: false });
    });
  });
}

function handleSelectionChange(val: Course[]) {
  multipleSelection.value = val;
}

function viewDetail(row: any) {
  router.push(`/system/course/detail/${row.id}`);
}

function goToPending() {
  router.push('/system/course/pending');
}

onMounted(() => {
  fetchList();
});
</script>

<style scoped>
.course-manage-card {
  margin: 20px auto;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06);
  border-radius: 12px;
  padding: 24px 24px 12px 24px;
}

.course-table {
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.course-pagination {
  text-align: right;
}

.course-dialog :deep(.el-dialog) {
  border-radius: 12px;
}
.dialog-form {
  padding: 10px 0 0 0;
}
.dialog-form .el-form-item {
  margin-bottom: 18px;
}
.dialog-form .el-upload {
  border-radius: 8px;
}
</style> 