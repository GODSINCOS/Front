import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import DynamicListView from '../views/new/DynamicListView.vue'
import DynamicAddView from '../views/new/DynamicAddView.vue'
import DynamicEditView from '../views/new/DynamicEditView.vue'
import DynamicDetailView from '../views/new/DynamicDetailView.vue'

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
        redirect: '/dashboard/dynamics',
        meta: { title: '系统管理', icon: 'Setting' },
        children: [
          {
            path: '/dashboard/dynamics',
            name: 'Dynamics',
            component: DynamicListView,
            meta: { title: '行业动态管理', icon: 'Promotion' }
          },
          {
            path: '/dashboard/dynamics/add',
            name: 'DynamicsAdd',
            component: DynamicAddView,
            meta: { title: '新增新闻' }
          },
          {
            path: '/dashboard/dynamics/edit/:id',
            name: 'DynamicsEdit',
            component: DynamicEditView,
            props: true,
            meta: { title: '编辑新闻' }
          },
          {
            path: '/dashboard/dynamics/detail/:id',
            name: 'DynamicsDetail',
            component: DynamicDetailView,
            props: true,
            meta: { title: '新闻详情' }
          }
        ]
      }
    ]
  }
]

// // 路由守卫
// router.beforeEach((to, from, next) => {
//   // 设置页面标题
//   document.title = `${to.meta.title} - 测盟汇管理系统`

//   // 判断是否需要登录权限
//   const token = localStorage.getItem('token')
//   if (to.path !== '/login' && to.path !== '/register' && !token) {
//     next('/login')
//   } else {
//     next()
//   }
// })

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
