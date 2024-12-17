import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Anime from '@/views/Anime.vue'
import UserCenter from '@/components/user/UserCenter.vue'
import { useTokenStore } from '@/stores/token'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/anime',
    name: 'Anime',
    component: Anime
  },
  {
    path: '/user-center',
    name: 'userCenter',
    component: UserCenter,
    meta: { requiresAuth: true }
  },
  {
    path: '/video/:id',
    name: 'VideoDetail',
    component: () => import('@/views/VideoDetail.vue')
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/components/ResetPassword.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const tokenStore = useTokenStore()
  if (to.meta.requiresAuth && !tokenStore.token) {
    next('/') // 未登录时重定向到首页
  } else {
    next()
  }
})

export default router 