import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/',
    component: () => import('../layout/main.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/home.vue'),
        meta: { title: '首页', icon: 'House' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/profile/info.vue'),
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
            name: 'User',
            component: () => import('../views/system/user/manage.vue'),
            meta: { title: '用户管理', icon: 'UserFilled', parent: '系统管理' }
          },
          {
            path: 'industry',
            name: 'Industry',
            component: () => import('../views/system/industry/manage.vue'),
            meta: { title: '行业动态管理', icon: 'Promotion', parent: '系统管理' }
          },
          {
            path: 'course',
            name: 'Course',
            component: () => import('../views/system/course/manage.vue'),
            meta: { title: '课程管理', icon: 'Reading', parent: '系统管理' }
          },
          {
            path: 'meeting',
            name: 'Meeting',
            component: () => import('../views/dashboard/home.vue'),
            meta: { title: '会议管理', icon: 'Calendar', parent: '系统管理' }
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
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title} - 测盟汇管理系统`

  // 判断是否需要登录权限
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && to.path !== '/register' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
