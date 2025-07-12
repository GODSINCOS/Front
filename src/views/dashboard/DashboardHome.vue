<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <div class="hero-banner">
      <div class="hero-content">
        <div class="hero-text">
          <h1>欢迎回来，{{ userStore?.userInfo?.nickname || userStore?.userInfo?.username || '用户' }}！</h1>
          <p>{{ getGreeting() }} · {{ getCurrentDate() }}</p>
          <div class="hero-actions">
            <el-button type="primary" size="large" @click="$router.push('/system/course')">
              <el-icon><Reading /></el-icon>
              开始学习
            </el-button>
            <el-button size="large" @click="$router.push('/profile')">
              <el-icon><UserFilled /></el-icon>
              个人中心
            </el-button>
          </div>
        </div>
        <div class="hero-illustration">
          <div class="floating-cards">
            <div class="card card-1">📚</div>
            <div class="card card-2">🎯</div>
            <div class="card card-3">📊</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据概览 -->
    <div class="overview-section" v-loading="loading">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="8">
          <div class="overview-card courses" @click="$router.push('/system/course')">
            <div class="card-icon">
              <el-icon><Reading /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-number">{{ stats.courses }}</div>
              <div class="card-label">课程总数</div>
              <div class="card-trend">
                <span class="trend-text">+{{ stats.newCourses }} 本周新增</span>
              </div>
            </div>
            <div class="card-corner"></div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="8">
          <div class="overview-card meetings" @click="$router.push('/system/meeting')">
            <div class="card-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-number">{{ stats.meetings }}</div>
              <div class="card-label">会议总数</div>
              <div class="card-trend">
                <span class="trend-text">{{ stats.todayMeetings }} 今日会议</span>
              </div>
            </div>
            <div class="card-corner"></div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="8">
          <div class="overview-card news" @click="$router.push('/system/dynamics')">
            <div class="card-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-number">{{ stats.news }}</div>
              <div class="card-label">行业动态</div>
              <div class="card-trend">
                <span class="trend-text">{{ stats.publishedNews }} 已发布</span>
              </div>
            </div>
            <div class="card-corner"></div>
          </div>
        </el-col>
      </el-row>
    </div>



    <!-- 功能区域 -->
    <el-row :gutter="24">
      <!-- 快捷操作 -->
      <el-col :xs="24" :md="12">
        <el-card class="shortcuts-card">
          <template #header>
            <span><el-icon><Grid /></el-icon> 快捷操作</span>
          </template>
          
          <div class="shortcuts-container">
            <div class="shortcuts-grid">
              <div v-for="shortcut in shortcuts" :key="shortcut.id" 
                   class="shortcut-item" @click="handleShortcut(shortcut)">
                <div class="shortcut-icon" :style="{ backgroundColor: shortcut.color }">
                  <component :is="shortcut.icon" />
                </div>
                <span class="shortcut-label">{{ shortcut.label }}</span>
                <div v-if="shortcut.badge" class="shortcut-badge">{{ shortcut.badge }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 近期会议 -->
      <el-col :xs="24" :md="12">
        <el-card class="meetings-card">
          <template #header>
            <div class="card-header">
              <span><el-icon><Calendar /></el-icon> 近期会议</span>
              <el-tag type="success" size="small">{{ upcomingMeetings.length }} 场会议</el-tag>
            </div>
          </template>
          
          <div class="meetings-list" v-loading="meetingsLoading">
            <div v-if="upcomingMeetings.length === 0" class="empty-state">
              <el-icon size="48" color="#d1d5db"><Calendar /></el-icon>
              <p>暂无近期会议</p>
            </div>
            <div v-else>
              <div v-for="meeting in upcomingMeetings.slice(0, 4)" :key="meeting.id" 
                   class="meeting-item"
                   @click="goToMeetingDetail(meeting.id)">
                <div class="meeting-status" :class="getMeetingStatusClass(meeting.startTime)">
                  <div class="status-dot"></div>
                  <span class="status-text">{{ getMeetingStatusText(meeting.startTime) }}</span>
                </div>
                <div class="meeting-content">
                  <h5>{{ meeting.name }}</h5>
                  <div class="meeting-meta">
                    <div class="meta-item">
                      <el-icon><Clock /></el-icon>
                      <span>{{ formatMeetingTime(meeting.startTime) }}</span>
                    </div>
                    <div class="meta-item" v-if="meeting.location">
                      <el-icon><LocationFilled /></el-icon>
                      <span>{{ meeting.location }}</span>
                    </div>
                    <div class="meta-item">
                      <el-icon><User /></el-icon>
                      <span>{{ meeting.creator || '未知' }}</span>
                    </div>
                  </div>
                                     <p v-if="meeting.description" class="meeting-description">{{ meeting.description }}</p>
                </div>
                <div class="meeting-arrow">
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>
              <div class="meetings-footer">
                <el-button text type="primary" @click="$router.push('/system/meeting')">
                  查看全部会议
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getCourseList } from '@/api/course'
// @ts-ignore
import { fetchMeetingList } from '@/api/meeting'
// @ts-ignore
import { fetchNewsList } from '@/api/news'
import { 
  Reading, Calendar, UserFilled, Document, Grid, ChatDotSquare, Clock, LocationFilled, User, ArrowRight
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const stats = reactive({
  courses: 0,
  meetings: 0,
  news: 0,
  newCourses: 0,
  todayMeetings: 0,
  publishedNews: 0
})

const loading = ref(true)



const shortcuts = computed(() => {
  const isAdmin = userStore?.userInfo?.roles?.includes('ROLE_ADMIN')
  const baseShortcuts = [
    { id: 1, label: '发布课程', icon: Reading, color: '#409eff', route: '/system/course', badge: 0 },
    { id: 2, label: '创建会议', icon: Calendar, color: '#67c23a', route: '/system/meeting/add', badge: 0 },
    { id: 3, label: '发布动态', icon: Document, color: '#e6a23c', route: '/system/dynamics/add', badge: 0 },
    { id: 4, label: '个人资料', icon: UserFilled, color: '#909399', route: '/profile', badge: 0 }
  ]
  
  if (isAdmin) {
    baseShortcuts.push(
      { id: 5, label: '用户管理', icon: UserFilled, color: '#606266', route: '/system/user', badge: 0 }
    )
  }
  
  return baseShortcuts
})

// 会议数据接口定义
interface MeetingItem {
  id: number
  name: string
  startTime: string
  endTime?: string
  location?: string
  creator?: string
  description?: string
  status: number
}

// 会议相关数据
const upcomingMeetings = ref<MeetingItem[]>([])
const meetingsLoading = ref(false)

// 加载近期会议数据
const loadUpcomingMeetings = async () => {
  meetingsLoading.value = true
  try {
    const allMeetingRes = await fetchMeetingList({ 
      pageNum: 1, 
      pageSize: 100
    })
    
    const allMeetingList = allMeetingRes.data?.list || allMeetingRes.list || []
    
    // 过滤审核通过且未过期的会议
    const now = new Date()
    const approvedMeetings = allMeetingList.filter((meeting: any) => {
      const meetingTime = new Date(meeting.startTime)
      return meeting.status === 1 && meetingTime >= now
    })
    
    // 按开始时间排序
    approvedMeetings.sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    
    upcomingMeetings.value = approvedMeetings
    console.log('近期会议数据:', approvedMeetings)
  } catch (error) {
    console.error('获取会议数据失败:', error)
    upcomingMeetings.value = []
  }
  meetingsLoading.value = false
}

// 会议相关函数
const goToMeetingDetail = (id: number) => {
  router.push(`/system/meeting/detail/${id}`)
}

const getMeetingStatusClass = (startTime: string) => {
  const now = new Date()
  const meetingTime = new Date(startTime)
  const diffHours = (meetingTime.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  if (diffHours <= 2) return 'status-soon'
  if (diffHours <= 24) return 'status-today'
  return 'status-upcoming'
}

const getMeetingStatusText = (startTime: string) => {
  const now = new Date()
  const meetingTime = new Date(startTime)
  const diffHours = (meetingTime.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  if (diffHours <= 1) return '即将开始'
  if (diffHours <= 2) return '2小时内'
  if (diffHours <= 24) return '今日会议'
  return '即将到来'
}

const formatMeetingTime = (timeStr: string) => {
  const time = new Date(timeStr)
  const now = new Date()
  
  // 如果是今天
  if (time.toDateString() === now.toDateString()) {
    return `今天 ${time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  }
  
  // 如果是明天
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (time.toDateString() === tomorrow.toDateString()) {
    return `明天 ${time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  }
  
  // 其他日期
  return time.toLocaleDateString('zh-CN', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 方法
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

const getCurrentDate = () => {
  const now = new Date()
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long'
  } as const
  return now.toLocaleDateString('zh-CN', options)
}





const handleShortcut = (shortcut: any) => {
  if (shortcut.route) {
    router.push(shortcut.route)
  }
}



// 加载真实统计数据
const loadStats = async () => {
  loading.value = true
  
  // 逐个加载数据，避免一个失败影响全部
  
  // 获取课程数据（只统计审核通过的）
  try {
    console.log('开始获取课程数据...')
    
    // 先获取所有课程数据
    const allCourseRes = await getCourseList({ 
      page: 1, 
      size: 1000
    })
    console.log('所有课程数据:', allCourseRes)
    
    // 手动过滤审核通过的课程
    const allCourseList = allCourseRes.list || []
    const approvedCourses = allCourseList.filter((course: any) => course.status === 1)
    
    stats.courses = approvedCourses.length
    
    // 获取本周新增课程（也只统计审核通过的）
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    
    const weekStartStr = weekStart.toISOString().split('T')[0]
    const newCourses = approvedCourses.filter((course: any) => {
      const courseDate = new Date(course.createTime).toISOString().split('T')[0]
      return courseDate >= weekStartStr
    })
    
    stats.newCourses = newCourses.length
    
    console.log('课程数据统计 - 总数:', allCourseList.length, '审核通过:', approvedCourses.length, '本周新增:', newCourses.length)
  } catch (error) {
    console.error('获取课程数据失败:', error)
    stats.courses = 0
    stats.newCourses = 0
  }
  
  // 获取会议数据（只统计审核通过的）
  try {
    console.log('开始获取会议数据...')
    
    // 先获取所有会议数据
    const allMeetingRes = await fetchMeetingList({ 
      pageNum: 1, 
      pageSize: 1000
    })
    console.log('所有会议数据:', allMeetingRes)
    
    // 手动过滤审核通过的会议
    const allMeetingList = allMeetingRes.data?.list || allMeetingRes.list || []
    const approvedMeetings = allMeetingList.filter((meeting: any) => meeting.status === 1)
    
    stats.meetings = approvedMeetings.length
    
    // 获取今日会议（也只统计审核通过的）
    const today = new Date().toISOString().split('T')[0]
    const todayMeetings = approvedMeetings.filter((meeting: any) => {
      const meetingDate = new Date(meeting.startTime).toISOString().split('T')[0]
      return meetingDate === today
    })
    
    stats.todayMeetings = todayMeetings.length
    
    console.log('会议数据统计 - 总数:', allMeetingList.length, '审核通过:', approvedMeetings.length, '今日会议:', todayMeetings.length)
  } catch (error) {
    console.error('获取会议数据失败:', error)
    stats.meetings = 0
    stats.todayMeetings = 0
  }
  
  // 获取新闻动态数据（只统计审核通过的）
  try {
    console.log('开始获取新闻数据...')
    
    // 先获取所有新闻数据
    const allNewsRes = await fetchNewsList({ 
      page: 1, 
      size: 1000  // 获取所有数据
    })
    console.log('所有新闻数据:', allNewsRes)
    
    // 手动过滤审核通过的新闻
    const allNewsList = allNewsRes.data?.list || allNewsRes.list || []
    const approvedNews = allNewsList.filter((news: any) => news.status === 1)
    
    stats.news = approvedNews.length
    stats.publishedNews = approvedNews.length
    
    console.log('新闻数据统计 - 总数:', allNewsList.length, '审核通过:', approvedNews.length)
  } catch (error) {
    console.error('获取新闻数据失败:', error)
    stats.news = 0
    stats.publishedNews = 0
  }
  

  
  loading.value = false
  
  // 检查是否有数据成功加载
  const hasData = stats.courses > 0 || stats.meetings > 0 || stats.news > 0
  if (hasData) {
    ElMessage.success('数据加载完成')
  } else {
    ElMessage.warning('部分数据加载失败，请检查网络连接或权限设置')
  }
}

onMounted(() => {
  loadStats()
  loadUpcomingMeetings()
})
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* 英雄横幅 */
.hero-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: float 8s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(-30px, -30px) rotate(10deg); }
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-text h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.hero-text p {
  font-size: 18px;
  opacity: 0.9;
  margin: 0 0 24px 0;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.hero-illustration {
  position: relative;
}

.floating-cards {
  position: relative;
  width: 120px;
  height: 120px;
}

.card {
  position: absolute;
  width: 60px;
  height: 60px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  animation: cardFloat 6s ease-in-out infinite;
}

.card-1 {
  top: 0;
  left: 0;
  animation-delay: 0s;
}

.card-2 {
  top: 20px;
  right: 0;
  animation-delay: 2s;
}

.card-3 {
  bottom: 0;
  left: 30px;
  animation-delay: 4s;
}

@keyframes cardFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* 数据概览 */
.overview-section {
  margin-bottom: 32px;
}

.overview-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  position: relative;
  overflow: hidden;
}

.overview-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.overview-card.courses { border-left: 4px solid #409eff; }
.overview-card.meetings { border-left: 4px solid #67c23a; }
.overview-card.news { border-left: 4px solid #e6a23c; }

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.overview-card.courses .card-icon { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #409eff; }
.overview-card.meetings .card-icon { background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); color: #67c23a; }
.overview-card.news .card-icon { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #e6a23c; }

.card-number {
  font-size: 36px;
  font-weight: 700;
  color: #1a202c;
  line-height: 1;
  margin-bottom: 8px;
}

.card-label {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 12px;
  font-weight: 500;
}

.card-trend {
  font-size: 14px;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-corner {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%);
  border-radius: 50%;
}

/* 卡片通用样式 */
.shortcuts-card, .meetings-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #1a202c;
}

.card-header span {
  display: flex;
  align-items: center;
  gap: 8px;
}



/* 快捷操作 */
.shortcuts-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 480px;
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border: 1px solid #f1f5f9;
  background: white;
  height: 120px;
  justify-content: center;
}

.shortcut-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
  transform: translateY(-2px);
}

.shortcut-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.shortcut-label {
  font-size: 13px;
  color: #475569;
  text-align: center;
  font-weight: 600;
  line-height: 1.2;
}

.shortcut-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ef4444;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
}

/* 近期会议 */
.meetings-list {
  max-height: 400px;
  overflow-y: auto;
}

.meeting-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #f1f5f9;
  background: white;
}

.meeting-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.meeting-status {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-text {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-soon .status-dot { background: #ef4444; }
.status-soon .status-text { color: #ef4444; }
.status-today .status-dot { background: #f59e0b; }
.status-today .status-text { color: #f59e0b; }
.status-upcoming .status-dot { background: #10b981; }
.status-upcoming .status-text { color: #10b981; }

.meeting-content {
  flex: 1;
  min-width: 0;
}

.meeting-content h5 {
  margin: 0 0 8px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1a202c;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meeting-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.meta-item .el-icon {
  width: 14px;
  height: 14px;
  color: #94a3b8;
}

.meeting-description {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meeting-arrow {
  color: #cbd5e1;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 4px;
}

.meeting-item:hover .meeting-arrow {
  color: #3b82f6;
  transform: translateX(4px);
}

.meetings-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  margin-top: 8px;
}



/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.empty-state p {
  margin: 12px 0 0 0;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .hero-content {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }
  
  .hero-text h1 {
    font-size: 24px;
  }
  
  .shortcuts-container {
    min-height: 280px;
    padding: 16px 0;
  }
  
  .shortcuts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    max-width: 320px;
  }
  
  .shortcut-item {
    height: 110px;
    padding: 16px 10px;
    gap: 6px;
  }
  
  .shortcut-icon {
    width: 42px;
    height: 42px;
    font-size: 18px;
  }
  
  .shortcut-label {
    font-size: 12px;
  }
}
</style> 