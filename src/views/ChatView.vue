<template>
  <div class="chat-view">
    <div class="chat-sidebar">
      <!-- 用户列表 -->
      <div class="chat-list">
        <div v-for="chat in chatList" 
             :key="chat.userId" 
             class="chat-item"
             :class="{ active: currentChat?.userId === chat.userId }"
             @click="selectChat(chat)"
        >
          <div class="chat-avatar">
            <el-avatar :size="40" :src="chat.userPic" />
            <div class="online-status" :class="{ online: chat.isOnline }"></div>
          </div>
          <div class="chat-info">
            <div class="chat-header">
              <span class="username">{{ chat.nickname }}</span>
              <span class="status-text">{{ chat.isOnline ? '在线' : '离线' }}</span>
            </div>
            <div class="last-message">{{ chat.lastMessage }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-main">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="user-info">
          <span class="username">{{ currentChat?.nickname }}</span>
          <span class="status-text" :class="{ online: currentChat?.isOnline }">
            {{ currentChat?.isOnline ? '在线' : '离线' }}
          </span>
        </div>
      </div>
      <!-- ... 其他内容 ... -->
      
      <!-- 聊天输入区域 -->
      <div class="chat-input">
        <div class="input-tools">
          <div class="emoji-picker" @click.stop="handleEmojiClick">
            <el-icon><SmileFilled /></el-icon>
          </div>
        </div>
        <div class="input-area">
          <el-input
            v-model="messageInput"
            type="textarea"
            :rows="3"
            placeholder="输入消息..."
            @keyup.enter.native.exact="sendMessage"
          />
        </div>
        <!-- 表情选择器弹窗 -->
        <div v-if="showEmojiPicker" 
             class="emoji-picker-popup"
             :style="emojiPickerStyle"
             @click.stop
        >
          <div class="emoji-list">
            <span v-for="emoji in emojiList" 
                  :key="emoji"
                  class="emoji-item"
                  @click.stop="insertEmoji(emoji)"
            >
              {{ emoji }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-avatar {
  position: relative;
  flex-shrink: 0;
}

/* 在线状态指示器 */
.online-status {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #9499a0;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.online-status.online {
  background-color: #4caf50;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e3e5e7;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-text {
  font-size: 12px;
  color: #9499a0;
}

.status-text.online {
  color: #4caf50;
}

/* ... 其他样式 ... */

.input-tools {
  margin-bottom: 8px;
}

.emoji-picker {
  display: inline-flex;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  color: #61666d;
  transition: all 0.3s;
}

.emoji-picker:hover {
  background: #f6f7f8;
  color: #fb7299;
}

.emoji-picker-popup {
  position: absolute;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 12px;
  z-index: 1000;
  min-width: 320px;
  max-height: 240px;
  overflow-y: auto;
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 20px;
}

.emoji-item:hover {
  background: #f6f7f8;
}

.chat-input {
  position: relative;
  border-top: 1px solid #e3e5e7;
  padding: 16px;
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo'
import { wsService } from '@/services/websocket'
import { useWebSocket } from '@/utils/websocket'
import { SmileFilled } from '@element-plus/icons-vue'

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

// 监听用户在线状态
const ws = useWebSocket()

// 表情相关
const showEmojiPicker = ref(false)
const emojiPickerStyle = computed(() => ({
  bottom: '100%',
  left: '0',
  marginBottom: '8px'
}))

// 处理表情点击
const handleEmojiClick = (event) => {
  showEmojiPicker.value = !showEmojiPicker.value
}

// 插入表情
const insertEmoji = (emoji) => {
  messageInput.value += emoji
  showEmojiPicker.value = false
}

// 点击其他地方关闭表情选择器
const handleClickOutside = (event) => {
  if (showEmojiPicker.value) {
    showEmojiPicker.value = false
  }
}

onMounted(() => {
  // 订阅用户在线状态变化
  ws.subscribe('userStatus', handleUserStatusChange)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  ws.unsubscribe('userStatus')
  document.removeEventListener('click', handleClickOutside)
})

// 处理用户状态变化
const handleUserStatusChange = (data) => {
  const { userId, isOnline } = data
  // 更新聊天列表中的用户状态
  const user = chatList.value.find(chat => chat.userId === userId)
  if (user) {
    user.isOnline = isOnline
  }
  // 更新当前聊天用户状态
  if (currentChat.value?.userId === userId) {
    currentChat.value.isOnline = isOnline
  }
}
</script>