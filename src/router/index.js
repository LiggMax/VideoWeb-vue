import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Anime from '@/views/Anime.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 