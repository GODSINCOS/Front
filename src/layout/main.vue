<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar-container">
      <div class="logo">
        <img src="@/assets/logo.svg" alt="东北大学校徽" class="logo-img" />
        <span class="logo-text">{{ isCollapse ? '测' : '测盟汇管理系统' }}</span>
      </div>
      <el-menu
        :default-active="route.path"
        class="el-menu-vertical"
        :router="true"
        :collapse="isCollapse"
      >
        <el-menu-item index="/dashboard">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/profile">
          <el-icon><User /></el-icon>
          <span>个人信息</span>
        </el-menu-item>
        <el-sub-menu index="/system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/user">
            <el-icon><UserFilled /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/system/industry">
            <el-icon><Promotion /></el-icon>
            <span>行业动态管理</span>
          </el-menu-item>
          <el-menu-item index="/system/course">
            <el-icon><Reading /></el-icon>
            <span>课程管理</span>
          </el-menu-item>
          <el-menu-item index="/system/meeting">
            <el-icon><Calendar /></el-icon>
            <span>会议管理</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <div class="header-left">
          <el-icon class="fold-button" @click="toggleSidebar">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.parent">{{ route.meta.parent }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userInfo.avatar">{{ userInfo.nickname?.[0] || userInfo.username?.[0] }}</el-avatar>
              <span class="username">{{ userInfo.nickname || userInfo.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 添加标签页导航 -->
      <div class="tabs-view-container">
        <el-tabs
          v-model="activeTab"
          type="card"
          @tab-click="handleTabClick"
          @tab-remove="handleTabRemove"
        >
          <el-tab-pane
            v-for="tab in visitedViews"
            :key="tab.path"
            :label="tab.title"
            :name="tab.path"
            :closable="tab.path !== '/dashboard'"
          />
        </el-tabs>
      </div>
      
      <el-main>
        <router-view v-slot="{ Component }">
          <keep-alive :include="cachedViews">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  House,
  User,
  UserFilled,
  ArrowDown,
  Setting,
  Promotion,
  Reading,
  Calendar,
  Fold,
  Expand
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const userInfo = ref({
  username: '',
  nickname: '',
  avatar: ''
})

// 访问过的页面标签
const visitedViews = ref([
  { path: '/dashboard', title: '首页' }
])
const cachedViews = ref(['Dashboard'])
const activeTab = ref('/dashboard')

// 控制侧边栏折叠状态
const isCollapse = ref(false)
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    addVisitedView(route)
    activeTab.value = newPath
  }
)

// 添加访问过的页面
const addVisitedView = (view: any) => {
  if (visitedViews.value.some(v => v.path === view.path)) return
  
  const title = view.meta.title || 'unknown'
  visitedViews.value.push({
    path: view.path,
    title: title
  })

  if (view.name && !cachedViews.value.includes(view.name)) {
    cachedViews.value.push(view.name)
  }
}

// 标签页点击
const handleTabClick = (tab: any) => {
  router.push(tab.props.name)
}

// 关闭标签页
const handleTabRemove = (targetPath: string) => {
  const tabs = visitedViews.value
  let activePath = activeTab.value
  
  if (activePath === targetPath) {
    tabs.forEach((tab, index) => {
      if (tab.path === targetPath) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activePath = nextTab.path
        }
      }
    })
  }
  
  visitedViews.value = tabs.filter(tab => tab.path !== targetPath)
  activeTab.value = activePath
  router.push(activePath)
}

// 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await userStore.fetchUserInfo()
    if (res) {
      userInfo.value = {
        username: res.username,
        nickname: res.nickname || res.username,
        avatar: res.avatar
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 下拉菜单命令处理
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      ElMessageBox.confirm('确认退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userStore.logout()
        router.push('/login')
      })
      break
  }
}

// 初始化
getUserInfo()
// 初始化当前页面的标签
if (route.path !== '/dashboard') {
  addVisitedView(route)
  activeTab.value = route.path
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar-container {
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
  border-bottom: 1px solid #dcdfe6;
  white-space: nowrap;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.logo-img {
  height: 40px;
  width: 40px;
  margin-right: 8px;
  flex-shrink: 0;
}

.logo-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.el-menu-vertical {
  border-right: none;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.fold-button {
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #f5f7fa;
  }
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 8px;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
}

/* 标签页样式 */
.tabs-view-container {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0 20px;
  .el-tabs {
    margin-bottom: -1px;
  }
  :deep(.el-tabs__header) {
    margin: 0;
  }
  :deep(.el-tabs__nav) {
    border: none;
  }
  :deep(.el-tabs__item) {
    height: 40px;
    line-height: 40px;
    border: 1px solid #dcdfe6;
    border-bottom: none;
    margin-right: 4px;
    border-radius: 4px 4px 0 0;
    transition: all 0.3s;
    
    &:hover {
      color: #409EFF;
    }
    
    &.is-active {
      background-color: #409EFF;
      border-color: #409EFF;
      color: #fff;
    }
  }
}
</style> 