<template>
  <div class="video-detail">
    <div class="main-content" :class="{ 'collapsed': isCollapsed || isAutoCollapsed }">
      <!-- 左侧视频区域 -->
      <div class="video-section">
        <!-- 视频播放器 -->
        <VideoPlayer 
          :video-url="videoInfo.videoUrl"
          :poster="videoInfo.cover"
          :title="videoInfo.title"
          :is-collapsed="isCollapsed || isAutoCollapsed"
          @toggle-collapse="toggleCollapse"
        />

        <!-- 视频信息 -->
        <div class="video-info">
          <h1 class="video-title">{{ videoInfo.title }}</h1>
          <div class="video-stats">
            <span class="view-count">{{ videoInfo.viewCount }}:播放</span>
            <span class="bullet">·</span>
            <span class="date">发布于 {{ formatDate(videoInfo.createTime) }}</span>
          </div>
        </div>


        <!-- 评论区 -->
        <div class="comment-section">
          <div class="comment-header">
            <h3>评论 {{ videoInfo.commentCount }}</h3>
          </div>
          
          <!-- 评论输入框 -->
          <div class="comment-input-area">
            <el-avatar :size="60" :src="userInfo.userPic" class="input-avatar" />
            <div class="input-wrapper">
              <el-input
                v-model="commentContent"
                type="textarea"
                :rows="2"
                placeholder="发一条友善的评论"
                resize="none"
                maxlength="300"
                show-word-limit
              />
              <div class="comment-tools">
                <div class="emoji-picker" @click="handleEmojiClick">
                  <el-icon><ChatRound /></el-icon>
                  表情
                  <EmojiPicker 
                    :visible="showEmojiPicker"
                    :position="emojiPosition"
                    @select="insertEmoji"
                    @close="showEmojiPicker = false"
                  />
                </div>
                <el-button type="primary" :disabled="!commentContent.trim()" @click="submitComment">
                  发布评论
                </el-button>
              </div>
            </div>
          </div>
          
          <!-- 评论列表 -->
          <div class="comment-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <el-avatar :size="48" :src="comment.userPic" class="comment-avatar" />
              <div class="comment-content">
                <div class="comment-user">
                  {{ comment.nickname }}
                  <UploaderIcon v-if="comment.userId === videoInfo.userId" />
                </div>
                <div class="comment-text">{{ comment.content }}</div>
                <div class="comment-info">
                  <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
                  <div class="comment-actions">
                    <span class="action-item">
                      <el-icon><Thumb /></el-icon>
                      {{ comment.likeCount }}
                    </span>
                    <span class="action-item">
                      <el-icon><ChatDotRound /></el-icon>
                      回复
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧推荐区域 -->
      <div class="recommend-section" :class="{ 'is-collapsed': isCollapsed || isAutoCollapsed }">
        <!-- UP主信息卡片 -->
        <div class="uploader-card">
          <div class="uploader-header">
            <el-avatar :size="48" :src="videoInfo.userPic" />
            <div class="uploader-info">
              <div class="nickname">{{ videoInfo.nickname }}</div>
              <div class="fans-count">100粉丝</div>
            </div>
          </div>
          <div class="uploader-desc">{{ videoInfo.introduction || '这个UP主很懒，还没有添加简介~' }}</div>
          <div v-if="!isSelfVideo" class="button-group">
            <el-button 
              type="primary" 
              class="follow-btn"
              :class="{ 'is-followed': isFollowed }"
              @click="handleFollow"
            >
              <el-icon><Plus /></el-icon>
              {{ isFollowed ? '已关注' : '关注' }}
            </el-button>
            <el-button class="message-btn" @click="goToChat">
              <el-icon><ChatDotRound /></el-icon>
              私信
            </el-button>
          </div>
        </div>

        <!-- 添加弹幕列表 -->
        <DanmakuList :videoId="videoId" />

        <h3 class="recommend-title">相关推荐</h3>
        <div class="recommend-list">
          <div v-for="video in recommendVideos" :key="video.id" class="recommend-item">
            <div class="recommend-cover">
              <img :src="video.cover" :alt="video.title">
              <span class="duration">{{ video.duration }}</span>
            </div>
            <div class="recommend-info">
              <div class="recommend-title">{{ video.title }}</div>
              <div class="recommend-uploader">
                <span class="up-name">{{ video.uploader }}</span>
                <div class="video-stats">
                  <span>{{ video.viewCount }}播放</span>
                  <span class="bullet">·</span>
                  <span>发布时间：{{ video.createTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {getVideoDetailService} from '@/api/video' // 假设你会创建这个API服务
import {  Plus, ChatDotRound,  ChatRound } from '@element-plus/icons-vue'
import VideoPlayer from '@/components/video/VideoPlayer.vue'
import {ElMessage, ElMessageBox} from "element-plus";
import useUserInfoStore from '@/stores/userInfo'
import UploaderIcon from '@/components/icons/UploaderIcon.vue'
import {addCommentService, getCommentsService} from "@/api/comments";
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import EmojiPicker from '@/components/EmojiPicker.vue'
import { useTokenStore } from '@/stores/token'
import eventBus from '@/utils/eventBus'
import DanmakuList from '@/components/video/DanmakuList.vue'
import {formatDate} from "@/utils/format";
import {followUserService, getUserFollowService} from '@/api/user/userfollow'

// 配置 dayjs
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// 格式化时间的函数
const formatCommentTime = (time) => {
  const now = dayjs()
  const commentTime = dayjs(time)
  const diffDays = now.diff(commentTime, 'day')

  if (diffDays < 1) {
    return commentTime.fromNow()  // 显示"几分钟前"、"几小时前"
  } else if (diffDays < 30) {
    return commentTime.format('MM-DD HH:mm')  // 显示"月-日 时:分"
  } else {
    return commentTime.format('YYYY-MM-DD')   // 显示完整日期
  }
}
const route = useRoute()
const router = useRouter()

// 视频详情数据模型
const videoInfo = ref({
  id: 0,
  title: '',//视频标题
  cover: '',//封面地址
  videoUrl: '',//视频地址
  viewCount: '',// 播放量
  createTime: '',//创建时间
  content: '',//视频简介
  commentCount: 0,//评论数
  nickname: '',//作者昵称
  userPic: '',//作者头像
  username: '',//作者用户名
})

// 获取视频详情
const getVideoDetail = async () => {
  try {
    // 从路由参数中获取视频ID
    const videoId = route.params.id
    
    // 如果有query参数，可以先用query参数中的数据做快速展示
    if (route.query.title) {
      videoInfo.value = {
        ...videoInfo.value,
        title: route.query.title,
        cover: route.query.cover
      }
    }
    
    // 调用API获取完整的视频详情
    const result = await getVideoDetailService(videoId)
    if (result.data) {
      videoInfo.value = result.data
      // 获取视频详情后，检查是否已关注
      if (isLogin.value) {
        checkFollowStatus()
      }
    }
    } catch (error) {
      console.error('获取视频详情失败:', error)
      ElMessage.error('获取视频详情失败')
    }
}

// 检查关注状态
const checkFollowStatus = async () => {
  try {
    const result = await getUserFollowService(videoInfo.value.userId)
    if (result.data) {
      // 判断 followUserId 是否等于视频作者的 userId
      isFollowed.value = result.data.some(item => item.followUserId === Number(videoInfo.value.userId))
    }
  } catch (error) {
    console.error('获取关注状态失败:', error)
  }
}

// 组件挂载时获取视频详情
onMounted(() => {
  getVideoDetail()
})

// 评论列表
const comments = ref([
])

// 推荐视频
const recommendVideos = ref([
])

// 添加收缩状态控制
const isCollapsed = ref(false)

// 切换收缩状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const userInfoStore = useUserInfoStore()
const userInfo = computed(() => userInfoStore.info)
const commentContent = ref('')  // 评论内容

// 提交评论方法
const submitComment = async () => {
    // 检查评论内容是否为空
    if (!commentContent.value.trim()) {
      return ElMessage.warning('评论内容不能为空')
    }
    // 从路由中获取当前视频ID
    const id = route.params.id
    // 调用添加评论接口
    await addCommentService(id, commentContent.value.trim())
    // 提示成功
    ElMessage.success('评论成功')
    
    // 清空评论内容
    commentContent.value = ''
    
    // 重新获取视频详情（更新评论数）
    await gteComment()
    
    // TODO: 重新获取评论列表（如果有分页获取评论列表的接口）
}
//获取评论内容
const gteComment = async () => {
  // 从路由中获取当前视频ID
  const id = route.params.id
  const res = await getCommentsService(id)
  comments.value = res.data
}
gteComment()

const showEmojiPicker = ref(false)
const emojiPosition = ref({ top: '40px', left: '0px' })

// 处理表情点击
const handleEmojiClick = (event) => {
  event.stopPropagation()  // 阻止事件冒泡
  showEmojiPicker.value = !showEmojiPicker.value
  if (showEmojiPicker.value) {
    // 计算弹窗位置
    const emojiButton = event.currentTarget
    const rect = emojiButton.getBoundingClientRect()
    emojiPosition.value = {
      top: '40px',  // 相对于按钮向下偏移
      left: '0'
    }
  }
}

// 插入表情
const insertEmoji = (emoji) => {
  commentContent.value += emoji
  showEmojiPicker.value = false
}

// 点击其他地方关闭表情选择器
const handleClickOutside = (event) => {
  const emojiPicker = event.target.closest('.emoji-picker-popup')
  const emojiButton = event.target.closest('.emoji-picker')
  if (showEmojiPicker.value && !emojiPicker && !emojiButton) {
    showEmojiPicker.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 添加跳转到私信页面的方法
const goToChat = () => {
  if (!isLogin.value) {
    eventBus.emit('showLogin')
    return
  }
  router.push({
    name: 'Chat',
    query: { username: videoInfo.value.username }
  })
}

// 判断是否是自己的视频
const isSelfVideo = computed(() => {
  return videoInfo.value.username === userInfo.value.username
})

// 添加 isLogin 计算属性
const tokenStore = useTokenStore()
const isLogin = computed(() => !!tokenStore.token)

// 获取视频ID
const videoId = computed(() => route.params.id)

// 添加自动收缩状态
const isAutoCollapsed = ref(false)

// 监听窗口大小变化
const handleResize = () => {
  isAutoCollapsed.value = window.innerWidth < 1200
}

// 组件挂载和卸载时添加/移除事件监听
onMounted(() => {
  handleResize() // 初始化状态
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 是否已关注
const isFollowed = ref(false)

// 处理关注/取关
const handleFollow = async () => {
  if (!isLogin.value) {
    eventBus.emit('showLogin')
    return
  }
  
  // 如果是取消关注，需要确认
  if (isFollowed.value) {
    try {
      await ElMessageBox.confirm(
        '确定取消关注该用户吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    } catch (error) {
      return // 用户取消操作
    }
  }

  try {
    await followUserService(videoInfo.value.userId, !isFollowed.value)
    isFollowed.value = !isFollowed.value
    ElMessage.success(isFollowed.value ? '关注成功' : '已取消关注')
  } catch (error) {
    console.error('关注操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 监听登录状态变化
watch(isLogin, (newVal) => {
  if (newVal && videoInfo.value.userId) {
    checkFollowStatus()
  } else {
    isFollowed.value = false
  }
})
</script>

<style scoped>
.video-detail {
  min-height: 100vh;
  background-color: #f1f2f3;
  padding: 20px 0;
}

/* 使用网格布局包装整个内容 */
.main-content {
  width: 100%;
  position: relative;
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 20px;
  padding: 0 20px;
  transition: all 0.3s ease-in-out;
}

.main-content.collapsed {
  grid-template-columns: 1fr 0;
}

/* 视频区域样式 */
.video-section {
  width: 100%;
  position: relative;
  transition: all 0.3s ease-in-out;
  min-width: 0;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 右侧区域样式 */
.recommend-section {
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  width: 380px; /* 固定右侧宽度 */
}

.recommend-section.is-collapsed {
  transform: translateX(100%);
  opacity: 0;
  width: 0;
  padding: 0;
  margin: 0;
}

/* 响应式布局调整 */
@media screen and (max-width: 1600px) {
  .main-content {
    max-width: 1400px;
  }
}

@media screen and (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 0 10px;
  }

  .video-section {
    padding: 0 10px;
  }
}

@media screen and (max-width: 768px) {
  .main-content {
    padding: 0;
  }

  .video-section {
    padding: 0;
  }
}

/* UP主信息卡片样式优化 */
.uploader-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.uploader-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.uploader-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.uploader-info {
  flex: 1;
  min-width: 0;
}

.nickname {
  font-size: 18px;
  font-weight: 600;
  color: #18191c;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nickname :deep(.uploader-icon) {
  color: #fb7299;
  transform: scale(0.9);
}

.fans-count {
  font-size: 14px;
  color: #9499a0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.fans-count .count {
  color: #fb7299;
  font-weight: 500;
}

.uploader-desc {
  font-size: 14px;
  color: #61666d;
  line-height: 1.6;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  position: relative;
  padding-left: 12px;
  border-left: 3px solid #fb7299;
  background: #fafafa;
  padding: 12px;
  border-radius: 8px;
}

.button-group {
  display: flex;
  gap: 12px;
}

.follow-btn {
  flex: 2;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #fb7299;
  border-color: #fb7299;
  
  &:hover {
    background: #fc8bab;
    border-color: #fc8bab;
    transform: translateY(-1px);
  }
  
  &.is-followed {
    background-color: #f4f4f5;
    border-color: #e4e4e4;
    color: #606266;
    
    &:hover {
      background-color: #fde2e2;
      border-color: #fbc4c4;
      color: #f56c6c;
    }
  }
}

.message-btn {
  flex: 1;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #fff;
  border: 1px solid #e3e5e7;
  color: #61666d;
  
  &:hover {
    background: #f4f5f7;
    border-color: #d0d3d7;
    color: #18191c;
    transform: translateY(-1px);
  }
}

/* 头像样式 */
:deep(.el-avatar) {
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(251, 114, 153, 0.2);
  transition: all 0.3s ease;
}

:deep(.el-avatar:hover) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(251, 114, 153, 0.3);
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .uploader-card {
    background: #232427;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  .nickname {
    color: #e5e7eb;
  }
  
  .uploader-desc {
    color: #9499a0;
    background: #18191c;
    border-left-color: #fb7299;
  }
  
  .message-btn {
    background: #2c2d30;
    border-color: #363739;
    color: #e5e7eb;
    
    &:hover {
      background: #363739;
      border-color: #4a4b4d;
    }
  }
}

/* 响应式调整 */
@media screen and (max-width: 1200px) {
  .uploader-card {
    padding: 20px;
  }
  
  .button-group {
    gap: 8px;
  }
}

/* 评论区样式优化 */
.comment-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.comment-header {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #18191c;
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-count {
  color: #fb7299;
  font-weight: 500;
}

/* 评论输入区域 */
.comment-input-area {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f1f2f3;
}

.input-avatar {
  flex-shrink: 0;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(251, 114, 153, 0.2);
  transition: transform 0.3s ease;
}

.input-avatar:hover {
  transform: scale(1.05);
}

.input-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:deep(.el-textarea__inner) {
  resize: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  border-color: #e3e5e7;
  transition: all 0.3s;
}

:deep(.el-textarea__inner:focus) {
  border-color: #fb7299;
  box-shadow: 0 0 0 2px rgba(251, 114, 153, 0.1);
}

.comment-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.emoji-picker {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  color: #61666d;
  transition: all 0.3s;
  font-size: 14px;
  
  &:hover {
    background: #f4f5f7;
    color: #fb7299;
  }
}

/* 评论列表样式 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  transition: all 0.3s;
  
  &:hover {
    background: #f9f9f9;
  }
}

.comment-avatar {
  flex-shrink: 0;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  
  &:hover {
    transform: scale(1.05);
  }
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-user {
  font-size: 14px;
  font-weight: 500;
  color: #fb7299;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-text {
  font-size: 14px;
  line-height: 1.6;
  color: #18191c;
  margin-bottom: 8px;
  word-break: break-word;
}

.comment-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #9499a0;
}

.comment-time {
  color: #9499a0;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    color: #fb7299;
  }
  
  :deep(.el-icon) {
    font-size: 16px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .comment-section {
    background: #232427;
  }
  
  .comment-header h3 {
    color: #e5e7eb;
  }
  
  .comment-item:hover {
    background: #2c2d30;
  }
  
  .comment-text {
    color: #e5e7eb;
  }
  
  :deep(.el-textarea__inner) {
    background: #2c2d30;
    border-color: #363739;
    color: #e5e7eb;
    
    &:focus {
      border-color: #fb7299;
      box-shadow: 0 0 0 2px rgba(251, 114, 153, 0.2);
    }
  }
  
  .emoji-picker:hover {
    background: #363739;
  }
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .comment-section {
    padding: 16px;
    border-radius: 0;
  }
  
  .comment-input-area {
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 16px;
  }
  
  .comment-item {
    padding: 12px;
  }
  
  .comment-actions {
    gap: 12px;
  }
}
</style> 