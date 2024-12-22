<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo'
import { wsService } from '@/services/websocket'
import { ElMessage } from 'element-plus'
import { Picture, Location } from '@element-plus/icons-vue'

// 获取当前用户信息
const userInfoStore = useUserInfoStore()
const currentUser = computed(() => userInfoStore.info)

// 添加缺失的响应式变量
const currentChat = ref(null)
const messageInput = ref('')
const messageArea = ref(null)
const isConnected = ref(false)

// 添加缺失的方法
const connectWebSocket = async () => {
  try {
    await wsService.connect(currentUser.value.id)
    isConnected.value = true
  } catch (error) {
    console.error('WebSocket连接失败:', error)
  }
}

const handleWebSocketMessage = (message) => {
  const { type, data } = message
  switch (type) {
    case 'chat_message':
      handleNewMessage(data)
      break
  }
}

const selectChat = (chat) => {
  currentChat.value = chat
  chat.unread = 0
  scrollToBottom()
}

const scrollToBottom = () => {
  setTimeout(() => {
    if (messageArea.value) {
      messageArea.value.scrollTop = messageArea.value.scrollHeight
    }
  }, 0)
}

// 生命周期钩子
onUnmounted(() => {
  wsService.removeMessageListener(handleWebSocketMessage)
  wsService.disconnect()
})
</script>