<template>
  <div class="chat-page">
    <!-- 左侧聊天列表 -->
    <div class="chat-list">
      <div class="list-header">
        <h3>私信列表</h3>
      </div>
      <div class="chat-items">
        <div 
          v-for="chat in chatList" 
          :key="chat.id" 
          class="chat-item"
          :class="{ 'active': currentChat?.id === chat.id }"
          @click="selectChat(chat)"
        >
          <div class="avatar-wrapper">
            <div class="avatar-container">
              <el-avatar :size="40" :src="chat.userPic" />
              <div 
                class="online-status" 
                :class="{ 'online': onlineStatus[chat.username] }"
              ></div>
            </div>
          </div>
          <div class="chat-info">
            <div class="chat-header">
              <span class="nickname">{{ chat.nickname }}</span>
            </div>
            <div class="last-message">
              {{ chat.lastMessage }}
              <span v-if="chat.unreadCount" class="unread-count">
                {{ formatUnreadCount(chat.unreadCount) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="chat-area">
      <template v-if="currentChat">
        <div class="chat-header">
          <div class="user-info">
            <span class="nickname">{{ currentChat.nickname }}</span>
          </div>
        </div>
        
        <div class="chat-messages" ref="messageContainer">
          <div 
            v-for="msg in messageList" 
            :key="msg.id" 
            class="message-bubble"
            :class="{ 'self': msg.isSelf, 'offline': msg.isOffline }"
          >
            <el-avatar 
              :size="32" 
              :src="msg.isSelf ? userInfo.userPic : currentChat.userPic" 
            />
            <div class="message-wrapper">
              <div class="message-content">{{ msg.content }}</div>
              <div class="message-time">{{ formatTime(msg.sendTime) }}</div>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <div class="input-tools">
            <div class="emoji-picker" @click="handleEmojiClick">
              <el-icon><ChatRound /></el-icon>
            </div>
          </div>
          <div class="input-area">
            <el-input
              v-model="messageContent"
              type="textarea"
              :rows="3"
              placeholder="发送消息..."
              resize="none"
              @keyup.enter.native.exact="sendMessage"
            />
          </div>
          <div class="send-btn">
            <el-button 
              type="primary" 
              :disabled="!messageContent.trim()"
              @click="sendMessage"
            >
              发送
            </el-button>
          </div>
        </div>
      </template>
      
      <div v-else class="empty-chat">
        <el-empty description="选择一个聊天" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatRound } from '@element-plus/icons-vue'
import useUserInfoStore from '@/stores/userInfo'
import { useRoute } from 'vue-router'
import { getUserChatService, getChatHistoryService, markAsReadService, getUnreadCountService, getOnlineStatusService } from '@/api/chat'  // 导入获取私信对象的接口
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import WebSocketClient from '@/utils/websocket'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const route = useRoute()
const userInfoStore = useUserInfoStore()
const userInfo = computed(() => userInfoStore.info)

// 聊天列表数据
const chatList = ref([])

// 当前选中的聊天
const currentChat = ref(null)

// 消息列表
const messageList = ref([])

// 输入的消息内容
const messageContent = ref('')

// 消息容器的引用
const messageContainer = ref(null)

// 创建WebSocket客户端
const ws = new WebSocketClient(
  'ws://127.0.0.1:8080/ws/chat',
  userInfo.value.username
)

// 添加在线状态存储
const onlineStatus = ref({})

// 获取聊天对象信息
const getChatUser = async (username) => {
  try {
    // 调用接口获取私信对象信息
    const res = await getUserChatService(username)
    console.log('Chat user response:', res) // 添加日志
    
    if (res.data && res.data[0]) {
      const userData = res.data[0]
      // 创建新的聊天对象
      const newChat = {
        id: Date.now(),
        username: userData.username || username, // 确保有用户名
        nickname: userData.nickname || username,
        userPic: userData.userPic || 'default-avatar.jpg',
        lastMessage: userData.message || '',
        lastTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        isOnline: false // 移除默认的在线状态
      }
      
      console.log('Created new chat:', newChat) // 添加日志
      
      // 如果不存在于聊天列表中，则添加
      const existChat = chatList.value.find(chat => chat.username === username)
      if (!existChat) {
        chatList.value.unshift(newChat)
        currentChat.value = newChat
      } else {


        currentChat.value = existChat
      }
      
      // 选中当前聊天
      selectChat(currentChat.value)
      
      // 获取新用户的在线状态
      updateOnlineStatus()
    } else {
      ElMessage.warning('未找到用户信息')
    }
  } catch (error) {
    console.error('获取聊天对象信息失败:', error)
    ElMessage.error('获取聊天对象信息失败')
  }
}

// 添加获取未读消息数量的方法
const loadUnreadCounts = async () => {
  try {
    if (!userInfo.value) return
    
    const res = await getUnreadCountService(userInfo.value.username)
    if (res.code === 0 && res.data) {
      // 更新聊天列表中的未读消息数量
      chatList.value.forEach(chat => {
        if (res.data[chat.username]) {
          chat.unreadCount = res.data[chat.username]
        }
      })
    }
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
  }
}

// 修改选择聊天的方法
const selectChat = async (chat) => {
  currentChat.value = chat
  // 清除未读消息数量
  chat.unreadCount = 0
  await loadMessages(chat.id)
  // 标记消息为已读
  if (userInfo.value) {
    await markAsReadService(chat.username, userInfo.value.username)
  }
}

// 加载消息记录
const loadMessages = async (chatId) => {
  try {
    if (!currentChat.value || !userInfo.value) return
    
    const res = await getChatHistoryService(
      userInfo.value.username,
      currentChat.value.username
    )
    
    if (res.data) {
      messageList.value = res.data.map(msg => ({
        id: msg.id,
        content: msg.content,
        isSelf: msg.fromUser === userInfo.value.username,
        time: dayjs(msg.createTime).format('HH:mm')
      }))
      
      // 标记消息为已读
      await markAsReadService(currentChat.value.username, userInfo.value.username)
    }
    
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('获取聊天记录失败:', error)
    ElMessage.error('获取聊天记录失败')
  }
}

// 发送消息
const sendMessage = async () => {
  if (!messageContent.value.trim()) {
    ElMessage.warning('消息不能为空')
    return
  }
  
  if (!currentChat.value || !currentChat.value.username) {
    ElMessage.warning('请选择聊天对象')
    return
  }
  
  const message = {
    type: 'chat',
    data: {
      to: currentChat.value.username,
      content: messageContent.value.trim(),
      time: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  }
  
  // 发送消息到服务器
  ws.sendMessage(message)
  
  // 添加到本地消息列表
  messageList.value.push({
    id: Date.now(),
    content: messageContent.value,
    isSelf: true,
    time: message.data.time
  })
  
  // 更新当前聊天的最后消息
  if (currentChat.value) {
    currentChat.value.lastMessage = messageContent.value.trim()
    currentChat.value.lastTime = message.data.time
    
    // 将当前聊天移到顶部
    const chatIndex = chatList.value.findIndex(chat => chat.username === currentChat.value.username)
    if (chatIndex > 0) {
      const chat = chatList.value[chatIndex]
      chatList.value.splice(chatIndex, 1)
      chatList.value.unshift(chat)
    }
  }
  
  messageContent.value = ''
  
  await nextTick()
  scrollToBottom()
}

// 修改消息接收处理方法
const handleReceivedMessage = async (message) => {
  if (message.type === 'chat') {
    const { from, content, time } = message.data
    
    // 检查消息是否已存在（防止重复）
    const isDuplicate = messageList.value.some(msg => 
      msg.content === content && 
      msg.time === time && 
      !msg.isSelf
    )
    
    if (isDuplicate) {
      return
    }
    
    // 如果是当前聊天的消息，添加到消息列表并标记为已读
    if (currentChat.value && from === currentChat.value.username) {
      messageList.value.push({
        id: Date.now(),
        content: content,
        isSelf: false,
        time: time
      })
      
      // 标记消息为已读
      await markAsReadService(from, userInfo.value.username)
    } else {
      // 如果不是当前聊天，增加未读消息数量
      const chatIndex = chatList.value.findIndex(chat => chat.username === from)
      if (chatIndex !== -1) {
        chatList.value[chatIndex].unreadCount = (chatList.value[chatIndex].unreadCount || 0) + 1
      }
    }
    
    // 更新聊天列表
    const chatIndex = chatList.value.findIndex(chat => chat.username === from)
    if (chatIndex !== -1) {
      const chat = chatList.value[chatIndex]
      chat.lastMessage = content
      chat.lastTime = time
      
      // 将有新消息的聊天移到顶部
      chatList.value.splice(chatIndex, 1)
      chatList.value.unshift(chat)
    } else {
      // 如果是新的聊天，获取用户信息并添加到列表
      await getChatUser(from)
    }
    
    // 如果是当前聊天，滚动到底部
    if (currentChat.value && from === currentChat.value.username) {
      await nextTick()
      scrollToBottom()
    }
  }
}

// 滚动到底部
const scrollToBottom = () => {
  const container = messageContainer.value
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

// 格式化时间
const formatTime = (time) => {
  const messageTime = dayjs(time)
  const now = dayjs()
  const diffDays = now.diff(messageTime, 'day')
  const diffYears = now.diff(messageTime, 'year')

  // 今天的消息只显示时间
  if (diffDays < 1) {
    return messageTime.format('HH:mm')
  }
  // 昨天的消息显示"昨天 时:分"
  else if (diffDays === 1) {
    return `昨天 ${messageTime.format('HH:mm')}`
  }
  // 一周内的消息显示"星期几 时:分"
  else if (diffDays < 7) {
    return messageTime.format('ddd HH:mm')
  }
  // 今年的消息显示"月-日 时:分"
  else if (diffYears < 1) {
    return messageTime.format('MM-DD HH:mm')
  }
  // 更早的消息显示完整日期"年-月-日 时:分"
  else {
    return messageTime.format('YYYY-MM-DD HH:mm')
  }
}

// 处理表情点击
const handleEmojiClick = () => {
  // TODO: 实现表情选择功能
}

// 添加未读消息数量显示
const formatUnreadCount = (count) => {
  if (!count) return ''
  return count > 99 ? '99+' : count
}

// 修改获取在线状态的方法
const updateOnlineStatus = async () => {
  try {
    const usernames = chatList.value.map(chat => chat.username)
    if (usernames.length === 0) return
    
    const res = await getOnlineStatusService(usernames)
    if (res.code === 0) {
      // 确保响应数据格式正确
      const statusData = res.data || {}
      Object.keys(statusData).forEach(username => {
        onlineStatus.value[username] = !!statusData[username] // 确保是布尔值
      })
    }
  } catch (error) {
    console.error('获取在线状态失败:', error)
  }
}

// 添加监听聊天列表变化
watch(chatList, async () => {
  // 当聊天列表变化时，更新在线状态
  await updateOnlineStatus()
}, { deep: true })

// 修改状态变更消息处理
const handleStatusMessage = (message) => {
  if (message.type === 'status') {
    const { username, online } = message.data
    // 使用 Vue 的响应式更新方法
    onlineStatus.value = {
      ...onlineStatus.value,
      [username]: !!online // 确保是布尔值
    }
  }
}

// 在 WebSocket 消息处理中添加状态处理
ws.onMessage((message) => {
  if (message.type === 'chat') {
    handleReceivedMessage(message)
  } else if (message.type === 'status') {
    handleStatusMessage(message)
  }
})

// 定期更新在线状态
onMounted(async () => {
  // 不需要重新连接，使用已有的连接
  if (!ws.isConnected) {
    ws.connect()
  }
  
  // 添加消息监听
  ws.onMessage(handleReceivedMessage)
  ws.onStatus(handleStatusMessage)
  
  // 从路由参数获取username并调用接口
  const username = route.query.username
  if (username) {
    await getChatUser(username)
  }
  
  // 获取未读消息数量
  await loadUnreadCounts()
  
  // 立即获取在线状态
  await updateOnlineStatus()
  const statusInterval = setInterval(updateOnlineStatus, 30000)
  
  onUnmounted(() => {
    clearInterval(statusInterval)
  })
})

onUnmounted(() => {
  // 关闭WebSocket连接
  ws.close()
})
</script>

<style scoped>
.chat-page {
  display: flex;
  height: calc(100vh - 60px);
  background: #fff;
  border-radius: 8px;
  margin: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 左侧聊天列表样式 */
.chat-list {
  width: 280px;
  border-right: 1px solid #e3e5e7;
  display: flex;
  flex-direction: column;
}

.list-header {
  padding: 16px;
  border-bottom: 1px solid #e3e5e7;
}

.list-header h3 {
  margin: 0;
  font-size: 16px;
  color: #18191c;
}

.chat-items {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.chat-item:hover {
  background: #f6f7f8;
}

.chat-item.active {
  background: #f0f1f2;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.nickname {
  font-size: 14px;
  font-weight: 500;
  color: #18191c;
}

.time {
  font-size: 12px;
  color: #9499a0;
}

.last-message {
  font-size: 13px;
  color: #61666d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 右侧聊天区域样式 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid #e3e5e7;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-bubble {
  display: flex;
  gap: 8px;
  max-width: 70%;
  opacity: 1;
  transition: opacity 0.3s;
}

.message-bubble.self {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-bubble.self .message-wrapper {
  align-items: flex-end;
}

.message-content {
  padding: 10px 16px;
  background: #f6f7f8;
  border-radius: 12px;
  font-size: 14px;
  color: #18191c;
  line-height: 1.5;
}

.message-bubble.self .message-content {
  background: #fb7299;
  color: #fff;
}

.message-time {
  font-size: 12px;
  color: #9499a0;
  padding: 0 4px;
}

.chat-input {
  border-top: 1px solid #e3e5e7;
  padding: 16px;
}

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

.input-area {
  margin-bottom: 12px;
}

:deep(.el-textarea__inner) {
  resize: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
}

.send-btn {
  display: flex;
  justify-content: flex-end;
}

.empty-chat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 添加未读消息数量样式 */
.unread-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  background-color: #fb7299;
  color: white;
  border-radius: 9px;
  font-size: 12px;
  margin-left: 8px;
}

/* 优化消息气泡样式 */
.message-bubble.offline {
  opacity: 0.8;
}

.avatar-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.avatar-container {
  position: relative;
  width: 40px;
  height: 40px;
}

.online-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #bbb;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.online-status.online {
  background-color: #00c853;
}
</style> 