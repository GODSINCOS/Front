<template>
  <el-card>
    <div style="margin-bottom: 16px; display: flex; gap: 10px; align-items: center;">
      <el-button type="primary" @click="goAdd">新增会议</el-button>
      <el-button v-if="isAdmin" type="primary" @click="showAdminAuditDialog = true">会议审核</el-button>
      <el-button type="primary" @click="showAllAuditDialog = true">我的会议</el-button>
      <el-input v-model="searchForm.name" placeholder="会议名称" style="width: 160px;" clearable />
      <el-input v-model="searchForm.creator" placeholder="创建人" style="width: 160px;" clearable />
      <el-date-picker
        v-model="searchForm.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 240px;"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        clearable
      />
      <!-- 只有管理员才显示状态筛选器 -->
      <el-select v-if="isAdmin" v-model="searchForm.status" placeholder="审核状态" style="width: 120px;">
        <el-option label="全部" :value="''" />
        <el-option label="待审核" :value="0" />
        <el-option label="已通过" :value="1" />
        <el-option label="未通过" :value="2" />
      </el-select>
      <el-button type="primary" @click="fetchList">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>
    <el-table :data="meetingList" style="width: 100%" class="mt-3">
      <el-table-column prop="name" label="会议名称" />
      <el-table-column prop="creator" label="创建人" />
      <el-table-column prop="startTime" label="开始时间" />
      <el-table-column prop="endTime" label="结束时间" />
      <el-table-column prop="status" label="审核状态" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.status === 1" type="success">已通过</el-tag>
          <el-tag v-else-if="row.status === 0" type="warning">待审核</el-tag>
          <el-tag v-else type="danger">未通过</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="320">
        <template #default="{ row }">
          <div style="display: flex; gap: 8px; align-items: center;">
            <el-button size="small" @click="goDetail(row.id)">详情</el-button>
            <!-- 编辑按钮：管理员可编辑所有会议，普通用户只能编辑自己的会议 -->
            <el-button 
              v-if="canEditMeeting(row)" 
              size="small" 
              type="primary" 
              @click="goEdit(row.id)"
            >
              编辑
            </el-button>
            <!-- 删除按钮：管理员可删除所有会议，普通用户只能删除自己的会议 -->
            <el-button 
              v-if="canDeleteMeeting(row)" 
              size="small" 
              type="danger" 
              @click="handleDelete(row.id)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="margin-top: 16px; text-align: right;"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      :page-sizes="[5, 10, 15, 20, 25]"
      layout="total, sizes, prev, pager, next, jumper"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
    <el-dialog v-model="showAllAuditDialog" title="我的会议审核结果" width="700px">
      <el-table :data="myMeetings" style="width: 100%">
        <el-table-column prop="name" label="会议名称" />
        <el-table-column prop="startTime" label="开始时间" />
        <el-table-column prop="endTime" label="结束时间" />
        <el-table-column prop="status" label="审核状态">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">已通过</el-tag>
            <el-tag v-else-if="row.status === 0" type="warning">待审核</el-tag>
            <el-tag v-else type="danger">未通过</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <div style="display: flex; gap: 8px;">
              <el-button 
                size="small" 
                type="primary" 
                @click="goEdit(row.id)"
              >
                编辑
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDelete(row.id)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="showAllAuditDialog = false">关闭</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="showAdminAuditDialog" title="会议审核" width="800px">
      <el-table :data="pendingMeetings" style="width: 100%">
        <el-table-column prop="name" label="会议名称" />
        <el-table-column prop="creator" label="创建人" />
        <el-table-column prop="startTime" label="开始时间" />
        <el-table-column prop="endTime" label="结束时间" />
        <el-table-column prop="status" label="审核状态">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="row.status === 1" type="success">已通过</el-tag>
            <el-tag v-else type="danger">未通过</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <template v-if="row.status === 0">
              <el-button size="small" type="success" @click="handleAudit(row.id, 1)">通过</el-button>
              <el-button size="small" type="danger" @click="handleAudit(row.id, 2)">拒绝</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="showAdminAuditDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchMeetingList, deleteMeeting, auditMeeting } from '@/api/meeting.js'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const meetingList = ref([])
const showAllAuditDialog = ref(false)
const myMeetings = ref([])
const showAdminAuditDialog = ref(false)
const pendingMeetings = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const isAdmin = computed(() =>
  (userStore.userInfo?.roles || []).some(role =>
    role === 'admin' || role === 'ROLE_ADMIN'
  )
)

console.log('isAdmin:', isAdmin.value)

// 根据用户权限初始化搜索表单
const searchForm = ref({
  name: '',
  creator: '',
  status: '',
  dateRange: null // 日期范围 [开始日期, 结束日期]
})

// 监听用户权限变化，设置默认状态
watch(
  () => isAdmin.value,
  (isAdminValue) => {
    // 如果不是管理员，默认只查看已通过的会议
    if (!isAdminValue && searchForm.value.status === '') {
      searchForm.value.status = 1
    }
    // 确保日期范围初始化为null
    if (searchForm.value.dateRange === undefined) {
      searchForm.value.dateRange = null
    }
  },
  { immediate: true }
)

const fetchList = async () => {
  const params = {
    name: searchForm.value.name,
    creator: searchForm.value.creator,
    // 普通用户只能查看已通过的会议，管理员可以查看所有状态
    status: isAdmin.value ? searchForm.value.status : 1,
    pageNum: currentPage.value,
    pageSize: pageSize.value
  }
  
  // 添加日期范围参数
  if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
    // 将日期转换为完整的日期时间格式以正确匹配数据库中的时间字段
    params.startDate = searchForm.value.dateRange[0] + ' 00:00:00'
    params.endDate = searchForm.value.dateRange[1] + ' 23:59:59'
  }
  
  const res = await fetchMeetingList(params)
  if (Array.isArray(res)) {
    meetingList.value = res
    total.value = res.length
  } else if (res && res.data && Array.isArray(res.data.list)) {
    meetingList.value = res.data.list
    total.value = res.data.total || 0
  } else if (res && Array.isArray(res.list)) {
    meetingList.value = res.list
    total.value = res.total || 0
  } else {
    meetingList.value = []
    total.value = 0
  }
}

const resetSearch = () => {
  // 管理员可以重置所有搜索条件，普通用户状态保持为已通过
  searchForm.value = { 
    name: '', 
    creator: '', 
    status: isAdmin.value ? '' : 1,
    dateRange: null
  }
  currentPage.value = 1
  fetchList()
}

const goAdd = () => router.push('/system/meeting/add')

const goEdit = async (id) => {
  // 如果是普通用户，提醒编辑后需要重新审核
  if (!isAdmin.value) {
    try {
      await ElMessageBox.confirm(
        '编辑会议后需要重新审核，确定要继续吗？', 
        '编辑提醒', 
        {
          confirmButtonText: '确定编辑',
          cancelButtonText: '取消',
          type: 'info'
        }
      )
    } catch {
      return // 用户取消编辑
    }
  }
  router.push(`/system/meeting/edit/${id}`)
}

const goDetail = (id) => router.push(`/system/meeting/detail/${id}`)

// 判断用户是否可以编辑会议
const canEditMeeting = (meeting) => {
  // 管理员可以编辑所有会议
  if (isAdmin.value) {
    return true
  }
  // 普通用户只能编辑自己创建的会议
  return meeting.userId === userStore.userInfo?.id
}

// 判断用户是否可以删除会议
const canDeleteMeeting = (meeting) => {
  // 管理员可以删除所有会议
  if (isAdmin.value) {
    return true
  }
  // 普通用户只能删除自己创建的会议
  return meeting.userId === userStore.userInfo?.id
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该会议吗？删除后将无法恢复！', 
      '删除确认', 
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: false
      }
    )
    
    const result = await deleteMeeting(id)
    if (result && result.success !== false) {
      ElMessage.success('会议删除成功')
      fetchList() // 刷新列表
      fetchMyMeetings() // 刷新我的会议列表
    } else {
      ElMessage.error(result?.message || '删除失败，请稍后重试')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除会议失败:', error)
      ElMessage.error(error?.message || '删除失败，请检查网络连接')
    }
  }
}

const fetchMyMeetings = async () => {
  const res = await fetchMeetingList({ userId: userStore.userInfo?.id })
  if (Array.isArray(res)) {
    myMeetings.value = res
  } else if (res && res.data && Array.isArray(res.data.list)) {
    myMeetings.value = res.data.list
  } else if (res && Array.isArray(res.list)) {
    myMeetings.value = res.list
  } else {
    myMeetings.value = []
  }
}

const fetchPendingMeetings = async () => {
  const res = await fetchMeetingList({ status: 0 })
  if (Array.isArray(res)) {
    pendingMeetings.value = res
  } else if (res && res.data && Array.isArray(res.data.list)) {
    pendingMeetings.value = res.data.list
  } else if (res && Array.isArray(res.list)) {
    pendingMeetings.value = res.list
  } else {
    pendingMeetings.value = []
  }
}

const handleAudit = async (id, status) => {
  try {
    const result = await auditMeeting(id, status)
    if (result && result.success !== false) {
      ElMessage.success(status === 1 ? '会议审核通过' : '会议审核拒绝')
      // 刷新待审核列表
      fetchPendingMeetings()
      // 刷新主会议列表，确保状态同步更新
      fetchList()
      // 如果用户查看的是自己的会议，也需要刷新
      fetchMyMeetings()
    } else {
      ElMessage.error(result?.message || '审核操作失败')
    }
  } catch (error) {
    console.error('审核会议失败:', error)
    ElMessage.error('审核操作失败，请稍后重试')
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchList()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchList()
}

watch(showAdminAuditDialog, (val) => {
  if (val) fetchPendingMeetings()
})

// 实时观察 userInfo 的变化
watch(
  () => userStore.userInfo,
  (val) => {
    console.log('userInfo:', val)
  },
  { immediate: true, deep: true }
)

// 实时观察 isAdmin 的变化
watch(
  () => isAdmin.value,
  (val) => {
    console.log('isAdmin:', val)
  },
  { immediate: true }
)

onMounted(() => {
  fetchList()
  fetchMyMeetings()
})
</script> 