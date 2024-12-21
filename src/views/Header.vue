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
import { getUnreadCountService, getOnlineStatusService } from '@/api/Chat'
import { Clock, Collection, Star, Message } from "@element-plus/icons-vue"
import UserPopover from "@/components/user/UserPopover.vue"
import { useRouter } from "vue-router"
import useUserInfoStore from "@/stores/userInfo"
import { useTokenStore } from '@/stores/token'
import eventBus from '@/utils/eventBus'
import WebSocketClient from '@/utils/websocket'

const router = useRouter()
const unreadCount = ref(0)
const userInfoStore = useUserInfoStore()
const tokenStore = useTokenStore()
const isLogin = computed(() => !!tokenStore.token)
const userInfo = computed(() => userInfoStore.info)

// 获取未读消息数量
const getUnreadCount = async () => {
  try {
    if (!isLogin.value || !userInfo.value) return

    const res = await getUnreadCountService(userInfo.value.username)
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

// 添加获取在线状态的方法
const updateOnlineStatus = async () => {
  try {
    if (!isLogin.value || !userInfo.value) return
    
    // 获取所有聊天用户的在线状态
    const res = await getOnlineStatusService([userInfo.value.username])
    if (res.code === 0) {
      // 更新在线状态
      console.log('用户在线状态:', res.data)
    }
  } catch (error) {
    console.error('获取在线状态失败:', error)
  }
}

// 修改 createWebSocket 方法
const createWebSocket = () => {
  if (isLogin.value && userInfo.value) {
    const ws = new WebSocketClient(
      'ws://127.0.0.1:8080/ws/chat',
      userInfo.value.username
    )
    
    // 连接 WebSocket
    ws.connect()
    
    // 监听状态变化
    ws.onStatus((message) => {
      if (message.type === 'status') {
        updateOnlineStatus()
      }
    })

    // 监听消息
    ws.onMessage((message) => {
      if (message.type === 'chat') {
        getUnreadCount()
      }
    })

    // 连接成功后立即获取在线状态
    ws.onOpen(() => {
      updateOnlineStatus()
    })
  }
}

// 修改监听逻辑
watch([() => isLogin.value, () => userInfo.value], ([newIsLogin, newUserInfo]) => {
  if (newIsLogin && newUserInfo) {
    createWebSocket()
    getUnreadCount()
    updateOnlineStatus() // 立即更新在线状态
  } else {
    WebSocketClient.clearInstance()
    unreadCount.value = 0
  }
}, { immediate: true })

// 添加定时更新
onMounted(() => {
  if (isLogin.value && userInfo.value) {
    // 定期更新在线状态和未读消息
    const updateInterval = setInterval(() => {
      updateOnlineStatus()
      getUnreadCount()
    }, 30000)

    onUnmounted(() => {
      clearInterval(updateInterval)
      WebSocketClient.clearInstance()
    })
  }
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