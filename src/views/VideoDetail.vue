<template>
  <div class="video-detail">
    <div class="main-content" :class="{ 'collapsed': isCollapsed }">
      <!-- 左侧视频区域 -->
      <div class="video-section">
        <!-- 视频播放器 -->
        <VideoPlayer 
          :video-url="videoInfo.videoUrl"
          :poster="videoInfo.cover"
          :title="videoInfo.title"
          :is-collapsed="isCollapsed"
          @toggle-collapse="toggleCollapse"
        />

        <!-- 视频信息 -->
        <div class="video-info">
          <h1 class="video-title">{{ videoInfo.title }}</h1>
          <div class="video-stats">
            <span class="view-count">{{ videoInfo.viewCount }}:播放</span>
            <span class="bullet">·</span>
            <span class="date">发布于 {{ formatPublishTime(videoInfo.createTime) }}</span>
          </div>
        </div>

        <!-- 视频简介 -->
        <div class="video-desc">
          <div class="desc-content">{{ videoInfo.content }}</div>
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
                  <span class="comment-time">{{ formatCommentTime(comment.createTime) }}</span>
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
      <div class="recommend-section" :class="{ 'is-collapsed': isCollapsed }">
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
            <el-button type="primary" class="follow-btn">
              <el-icon><Plus /></el-icon>
              关注
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
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {getVideoDetailService, getVideoListService} from '@/api/video' // 假设你会创建这个API服务
import { VideoPlay, Plus, ChatDotRound, CaretRight, ChatRound } from '@element-plus/icons-vue'
import VideoPlayer from '@/components/video/VideoPlayer.vue'
import {ElMessage} from "element-plus";
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

// 格式化发布时间
const formatPublishTime = (time) => {
  if (!time) return ''
  const publishTime = dayjs(time)
  const now = dayjs()
  const diffDays = now.diff(publishTime, 'day')

  if (diffDays < 1) {
    return publishTime.fromNow()  // 显示"几分钟前"、"几小时前"
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else if (diffDays < 30) {
    return publishTime.format('MM-DD')  // 显示"月-日"
  } else {
    return publishTime.format('YYYY-MM-DD')  // 显示完整日期
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
    }
  } catch (error) {
    console.error('获取视频详情失败:', error)
    ElMessage.error('获取视频详情失败')
  }
}

// 组件挂载时获取视频详情
onMounted(() => {
  getVideoDetail()
})

// 评论列表
const comments = ref([
  {
    id: 1,
    nickname: '用户A',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    content: '这个视频太棒了！',
    createTime: '2024-01-22',
    likeCount: 66
  },
  {
    id: 2,
    nickname: '用户B',
    userPic: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    content: '期待更新！',
    createTime: '2024-01-22',
    likeCount: 23
  }
])

// 推荐视频
const recommendVideos = ref([
  {
    id: 1,
    title: '推荐视频标题1',
    cover: 'https://play.xfvod.pro/images/hb/baiquan.jpg',
    duration: '12:34',
    uploader: 'UP主1',
    viewCount: '5.2万',
    createTime: '3天前'
  },
  {
    id: 2,
    title: '推荐视频标题2',
    cover: 'https://play.xfvod.pro/images/hb/lx.jpg',
    duration: '05:23',
    uploader: 'UP主2',
    viewCount: '2.8万',
    createTime: '1天前'
  }
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

// 判断是��是自己的视频
const isSelfVideo = computed(() => {
  return videoInfo.value.username === userInfo.value.username
})

// 添加 isLogin 计算属性
const tokenStore = useTokenStore()
const isLogin = computed(() => !!tokenStore.token)

// 获取视频ID
const videoId = computed(() => route.params.id)

</script>

<style scoped>
.video-detail {
  min-height: 100vh;
  background-color: #f1f2f3;
  padding: 20px 0;
}

.main-content {
  position: relative;
  max-width: 1800px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  padding: 0 20px;
  transition: all 0.3s ease-in-out;
}

.main-content.collapsed {
  grid-template-columns: 1fr 0;
}

/* 当屏幕宽度大于 1920px 时限制最大宽度 */
@media screen and (min-width: 1920px) {
  .main-content {
    max-width: 2200px;
  }
}

/* 右侧区域样式 */
.recommend-section {
  overflow: hidden;
  transition: all 0.3s ease-in-out;
}

.recommend-section.is-collapsed {
  transform: translateX(100%);
  opacity: 0;
  width: 0;
  padding: 0;
  margin: 0;
}

/* 视频区域样式 */
.video-section {
  width: 100%;
  position: relative;
  transition: all 0.3s ease-in-out;
  padding-right: 24px;
  min-width: 680px;
}

/* 确保视频播放器响应式 */
.video-section :deep(.video-player) {
  width: 100%;
  transition: all 0.3s ease-in-out;
  min-height: 470px;
}

.video-info {
  padding: 20px 0;
  border-bottom: 1px solid #e3e5e7;
}

.video-title {
  font-size: 35px;
  font-weight: bold;
  color: #18191c;
  margin: 0 0 16px;
  line-height: 1.4;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}

.video-stats {
  color: #9499a0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bullet {
  color: #ccc;
}

/* 评论区样式 */
.comment-section {
  padding: 20px 0;
}

.comment-header {
  margin-bottom: 24px;
}

.comment-header h3 {
  font-size: 18px;
  color: #18191c;
  font-weight: bold;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #e3e5e7;
}

.comment-avatar {
  flex-shrink: 0;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.comment-avatar:hover {
  transform: scale(1.05);
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-user {
  font-size: 14px;
  font-weight: 500;
  color: #18191c;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.comment-text {
  font-size: 14px;
  color: #18191c;
  line-height: 1.6;
  margin-bottom: 8px;
}

.comment-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-time {
  font-size: 12px;
  color: #9499a0;
  transition: color 0.3s;
}

.comment-time:hover {
  color: #61666d;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9499a0;
  cursor: pointer;
}

.action-item:hover {
  color: #fb7299;
}

/* 右侧推荐区域 */
.recommend-section {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.recommend-title {
  font-size: 16px;
  font-weight: bold;
  color: #18191c;
}

.recommend-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  cursor: pointer;
}

.recommend-cover {
  width: 160px;
  height: 90px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.recommend-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 0 4px;
  border-radius: 2px;
  font-size: 12px;
}

.recommend-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.recommend-info .recommend-title {
  font-size: 14px;
  font-weight: normal;
  color: #18191c;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recommend-uploader {
  font-size: 12px;
  color: #9499a0;
}

.up-name {
  display: block;
  margin-bottom: 4px;
}

.video-stats {
  font-size: 12px;
}

/* 右侧用户信息卡片样式 */
.uploader-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.uploader-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.uploader-info {
  flex: 1;
  min-width: 0;
}

.nickname {
  font-size: 16px;
  font-weight: 500;
  color: #18191c;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fans-count {
  font-size: 13px;
  color: #9499a0;
}

.uploader-desc {
  font-size: 13px;
  color: #61666d;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.button-group {
  display: flex;
  gap: 12px;
}

.follow-btn {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #fb7299;
  border-color: #fb7299;
  font-size: 14px;
}

.message-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
  background: #fff;
  border-color: #e3e5e7;
  color: #61666d;
}

.message-btn:hover {
  background: #f4f5f7;
  border-color: #d0d3d7;
  color: #18191c;
}

@media screen and (max-width: 1200px) {
  .main-content {
    max-width: 100%;
    flex-direction: column;
  }

  .recommend-section {
    width: 100%;
  }

  .recommend-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }
}

/* 评论输入区域样式 */
.comment-input-area {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #e3e5e7;
}

.input-avatar {
  flex-shrink: 0;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.input-avatar:hover {
  transform: scale(1.05);
}

.input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.el-textarea__inner) {
  resize: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  transition: all 0.3s;
}

:deep(.el-textarea__inner:focus) {
  border-color: #fb7299;
  box-shadow: 0 0 0 2px rgba(251, 114, 153, 0.2);
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
  color: #61666d;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  transition: all 0.3s;
  position: relative;
}

.emoji-picker:hover {
  background-color: #f4f5f7;
  color: #fb7299;
}

:deep(.el-button--primary) {
  background-color: #fb7299;
  border-color: #fb7299;
}

:deep(.el-button--primary:hover) {
  background-color: #fc8bab;
  border-color: #fc8bab;
}

:deep(.el-button--primary:disabled) {
  background-color: #fbd4e0;
  border-color: #fbd4e0;
}

.author-icon {
  margin-left: 4px;
  transform: scale(0.8);
  flex-shrink: 0;
}

/* 在小屏幕上调整最小尺寸 */
@media screen and (max-width: 768px) {
  .video-section {
    min-width: 100%;
    padding-right: 0;
  }

  .video-section :deep(.video-player) {
    min-height: auto;
  }
}

.info-container {
  /* 现有样式 */
  
  /* 调整弹幕列表容器样式 */
  .danmaku-list-container {
    margin: 16px 0;
    border-radius: 8px;
    overflow: hidden;
  }
}
</style> 