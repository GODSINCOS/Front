import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

import DynamicListView from '../views/news/DynamicListView.vue'
import DynamicAddView from '../views/news/DynamicAddView.vue'
import DynamicEditView from '../views/news/DynamicEditView.vue'
import DynamicDetailView from '../views/news/DynamicDetailView.vue'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/LoginPage.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/RegisterPage.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/enterprise-register',
    name: 'EnterpriseRegister',
    component: () => import('../views/auth/EnterpriseRegisterPage.vue'),
    meta: { title: '企业注册' }
  },
  {
    path: '/',
    component: () => import('../layout/MainLayout.vue'),
      redirect: (to) => {
    // 检查是否有token，没有token则重定向到登录页
    const token = sessionStorage.getItem('token')
    if (!token || token === '' || token === 'null' || token === 'undefined') {
      return '/login'
    }
    return '/dashboard'
  },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/DashboardHome.vue'),
        meta: { title: '首页', icon: 'House' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/profile/ProfileInfo.vue'),
        meta: { title: '个人信息', icon: 'User' }
      },
      {
        path: 'system',
        name: 'System',
        redirect: '/system/user',
        meta: { title: '系统管理', icon: 'Setting' },
        children: [
          {
            path: 'user',
            name: 'UserManagement',
            component: () => import('../views/system/user/UserList.vue'),
            meta: { title: '用户管理', icon: 'User' }
          },
          {
            path: 'dynamics',
            name: 'Dynamics',
            component: DynamicListView,
            meta: { title: '行业动态管理', icon: 'Promotion' }
          },
          {
            path: 'dynamics/add',
            name: 'DynamicsAdd',
            component: DynamicAddView,
            meta: { title: '新增新闻' }
          },
          {
            path: 'dynamics/edit/:id',
            name: 'DynamicsEdit',
            component: DynamicEditView,
            props: true,
            meta: { title: '编辑新闻' }
          },
          {
            path: 'dynamics/detail/:id',
            name: 'DynamicsDetail',
            component: DynamicDetailView,
            props: true,
            meta: { title: '新闻详情' }
          },
          {
            path: 'my-dynamics',
            name: 'MyDynamics',
            component: () => import('../views/news/UserNewsManage.vue'),
            meta: { title: '我的动态管理', icon: 'Document' }
          },
          {
            path: 'dynamics/audit',
            name: 'DynamicsAudit',
            component: () => import('../views/news/NewsAudit.vue'),
            meta: { title: '审核动态', icon: 'Check' }
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  console.log('路由守卫检查:', to.path)
  
  // 设置页面标题
  document.title = `${to.meta.title} - 测盟汇管理系统`

  const whiteList = ['/login', '/register', '/enterprise-register']
  
  // 如果是白名单路径，直接放行
  if (whiteList.includes(to.path)) {
    console.log('白名单路径，直接放行')
    next()
    return
  }

  // 检查token
  const token = sessionStorage.getItem('token')
  console.log('当前token:', token)
  
  if (!token || token === '' || token === 'null' || token === 'undefined') {
    console.log('token无效，清除状态并跳转到登录页')
    // 清除所有用户相关状态
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('userInfo')
    localStorage.removeItem('token') // 也清除localStorage中可能残留的
    localStorage.removeItem('userInfo')
    
    const userStore = useUserStore()
    userStore.token = ''
    userStore.userInfo = null
    
    ElMessage.warning('请先登录')
    next('/login')
    return
  }

  // 权限检查 - 用户管理页面只有管理员可以访问
  if (to.path === '/system/user') {
    const userStore = useUserStore()
    
    // 如果用户信息不存在，先获取用户信息
    if (!userStore.userInfo) {
      try {
        await userStore.fetchUserInfo()
      } catch (error) {
        console.error('获取用户信息失败:', error)
        ElMessage.error('获取用户信息失败')
        next('/login')
        return
      }
    }
    
    // 检查是否有用户管理权限
    if (!userStore.hasUserManagePermission) {
      console.log('用户没有访问用户管理的权限')
      ElMessage.warning('您没有权限访问该页面')
      next('/dashboard')
      return
    }
  }

  console.log('token有效，继续路由')
  next()
})

export default router
