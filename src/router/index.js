import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Anime from '@/views/Anime.vue'
import UserCenter from '@/components/user/UserCenter.vue'
import SearchResult from '@/views/SearchResult.vue'
import { useTokenStore } from '@/stores/token'
import Live from '@/views/Live.vue'

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
    path: '/search',
    name: 'SearchResult',
    component: SearchResult
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
    component: () => import('@/components/video/VideoDetail.vue')
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/components/ResetPassword.vue')
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/UserChat.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/anime/manage/:id',
    name: 'AnimeEpisodeManager',
    component: () => import('@/components/anime/AnimeEpisodeManager.vue')
  },
  {
    path: '/anime/episode/:id',
    name: 'AnimeEpisodeManager',
    component: () => import('@/components/anime/AnimeEpisodeManager.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/user',
    name: 'UserHome',
    component: () => import('@/views/UserHome.vue')
  },
  {
    path: '/live',
    name: 'Live',
    component: Live,
    meta: {
      title: '直播-蒔饭动漫',
      keepAlive: true
    }
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