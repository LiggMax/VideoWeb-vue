<template>
  <div class="right-section">
    <div class="user-info">
      <UserPopover v-if="isLogin" />
      <div v-else class="user-avatar" @click="showLoginDialog">
        <el-avatar :size="42" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
      </div>
      <div class="user-icons">
        <el-badge :value="unreadCount" :hidden="!unreadCount" class="message-badge">
          <el-icon @click="goToChat"><Message /></el-icon>
        </el-badge>
        <el-icon><Star /></el-icon>
        <el-icon><Collection /></el-icon>
        <el-icon><Clock /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { getUnreadCountService } from '@/api/Chat'
import { Clock, Collection, Star, Message } from "@element-plus/icons-vue"
import UserPopover from "@/components/user/UserPopover.vue"
import { useRouter } from "vue-router"
import useUserInfoStore from "@/stores/userInfo"
import { useTokenStore } from '@/stores/token'
import eventBus from '@/utils/eventBus'

const router = useRouter()
const unreadCount = ref(0)
const userInfoStore = useUserInfoStore()
const tokenStore = useTokenStore()
const isLogin = computed(() => !!tokenStore.token)

// 获取未读消息数量
const getUnreadCount = async () => {
  try {
    if (!isLogin.value || !userInfoStore.info) return

    const res = await getUnreadCountService(userInfoStore.info.username)
    if (res.code === 0) {
      // 计算所有未读消息的总数
      const total = Object.values(res.data || {}).reduce((sum, count) => sum + count, 0)
      unreadCount.value = total > 99 ? '99+' : total
    }
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
  }
}

// 跳转到聊天页面
const goToChat = () => {
  if (!isLogin.value) {
    showLoginDialog()
    return
  }
  router.push({
    name: 'Chat'
  })
}

// 监听登录状态变化
watch(() => isLogin.value, (newVal) => {
  if (newVal) {
    getUnreadCount() // 登录后获取未读消息数量
  } else {
    unreadCount.value = 0 // 登出时清空未读消息数量
  }
})

// 监听用户信息变化
watch(() => userInfoStore.info, (newVal) => {
  if (newVal && isLogin.value) {
    getUnreadCount()
  }
}, { immediate: true })

// 定期更新未读消息数量
let updateInterval
onMounted(() => {
  // 如果已登录，开始定期更新未读消息数量
  if (isLogin.value && userInfoStore.info) {
    getUnreadCount()
    updateInterval = setInterval(getUnreadCount, 30000) // 每30秒更新一次
  }
})

onUnmounted(() => {
  clearInterval(updateInterval) // 清除定时器
})

// 监听新消息事件
eventBus.on('newMessage', () => {
  if (isLogin.value) {
    getUnreadCount()
  }
})

// 显示登录对话框
const showLoginDialog = () => {
  eventBus.emit('showLogin')
}
</script>

<style scoped>
.message-badge {
  cursor: pointer;
}

.message-badge :deep(.el-badge__content) {
  background-color: #fb7299;
  border: none;
  transform: translate(30%, -30%);
  font-size: 12px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  font-weight: normal;
}

.user-icons .el-icon {
  font-size: 22px;
  color: #61666d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.user-icons .el-icon:hover {
  color: #fb7299;
  background-color: #f1f2f3;
}

/* 添加消息图标的特殊悬停效果 */
.message-badge .el-icon:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}
</style> 