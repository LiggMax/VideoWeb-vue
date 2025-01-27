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
            :video-id="videoInfo.id"
            @toggle-collapse="toggleCollapse"
        />

        <!-- 视频信息 -->
        <div class="video-info">
          <!-- 视频信息和UP主信息的布局容器 -->
          <div class="info-wrapper" :class="{ 'wide-screen': isCollapsed || isAutoCollapsed }">
            <!-- 左侧视频信息 -->
            <div class="video-content">
              <!-- 视频标题和统计信息 -->
              <h1 class="video-title">{{ videoInfo.title }}</h1>
              <div class="video-stats">
                <span class="view-count">100W 播放</span>
                <span class="bullet">·</span>
                <span class="date">发布于 {{ formatDate(videoInfo.createTime) }}</span>
              </div>

              <!-- 添加互动按钮组 -->
              <div class="video-actions">
                <div class="action-item">
                  <button class="action-btn"
                          :class="{ 'is-active': interactionStates.like }"
                          @click="handleInteraction('like', 'likesCount')"
                  >
                    <img :src="LikeIcon" class="action-icon" alt="点赞"/>
                    {{ videoInfo.likesCount || 0 }}
                  </button>
                </div>
                <div class="action-item">
                  <el-button class="action-btn" :class="{ 'is-active': interactionStates.favorite }" @click="handleInteraction('favorite')">
                    <img :src="StarIcon" class="action-icon" alt="收藏"/>
                    {{ videoInfo.favoriteCount }}
                  </el-button>
                </div>
                <div class="action-item">
                  <el-button class="action-btn">
                    <img :src="CoinIcon" class="action-icon" alt="投币"/>
                    <span>投币</span>
                  </el-button>
                </div>
              </div>

              <!-- 添加视频简介区域 -->
              <div class="video-description">
                <div class="description-header">
                  <span>视频简介</span>
                </div>
                <div class="description-content">
                  {{ videoInfo.content || '暂无简介' }}
                </div>
              </div>
            </div>

            <!-- 右侧UP主信息 - 宽屏模式下显示 -->
            <div class="uploader-info-section" v-if="isCollapsed || isAutoCollapsed">
              <div class="uploader-card">
                <div class="uploader-header">
                  <el-avatar
                      :size="48"
                      :src="videoInfo.userPic"
                      class="clickable"
                      @click="goToUserHome"
                  />
                  <div class="uploader-info" @click="goToUserHome">
                    <div class="nickname">{{ videoInfo.nickname }}</div>
                    <div class="fans-count">{{ videoInfo.fansCount || 0 }}粉丝</div>
                  </div>
                </div>
                <div class="uploader-desc">{{ videoInfo.introduction || '这个UP主很懒，还没有添加简介~' }}</div>
                <div v-if="isLogin && !isSelfVideo" class="button-group">
                  <div class="follow-btn-wrapper"
                       @mouseenter="handleMouseEnter"
                       @mouseleave="handleMouseLeave"
                  >
                    <el-button
                        type="primary"
                        class="follow-btn"
                        :class="{ 'is-followed': isFollowed }"
                        @click="!isFollowed && handleFollow()"
                    >
                      <img :src="isFollowed ? Unfollow : concernIcon" class="follow-icon" alt="关注"/>
                      {{ isFollowed ? '已关注' : '关注' }}
                    </el-button>
                    <div class="unfollow-dropdown"
                         v-show="showUnfollow"
                         @click="handleFollow"
                    >
                      <el-icon>
                        <Close/>
                      </el-icon>
                      取消关注
                    </div>
                  </div>
                  <el-button class="message-btn" @click="goToChat">
                    <el-icon>
                      <ChatDotRound/>
                    </el-icon>
                    私信
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="comment-section">
          <div class="comment-header">
            <h3>评论 {{ videoInfo.commentCount }}</h3>
          </div>

          <!-- 评论输入框 -->
          <div class="comment-input-area">
            <el-avatar :size="60" :src="userInfo.userPic" class="input-avatar"/>
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
                  <el-icon>
                    <ChatRound/>
                  </el-icon>
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
              <el-avatar :size="48" :src="comment.userPic" class="comment-avatar"/>
              <div class="comment-content">
                <div class="comment-user">
                  {{ comment.nickname }}
                  <UploaderIcon v-if="comment.userId === videoInfo.id"/>
                </div>
                <div class="comment-text">{{ comment.content }}</div>
                <div class="comment-info">
                  <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
                  <div class="comment-actions">
                    <span class="action-item">
                      <el-icon><Thumb/></el-icon>
                      {{ comment.likeCount }}
                    </span>
                    <span class="action-item">
                      <el-icon><ChatDotRound/></el-icon>
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
        <div class="uploader-card" v-if="!(isCollapsed || isAutoCollapsed)">
          <div class="uploader-header">
            <el-avatar
                :size="48"
                :src="videoInfo.userPic"
                class="clickable"
                @click="goToUserHome"
            />
            <div class="uploader-info" @click="goToUserHome">
              <div class="nickname">{{ videoInfo.nickname }}</div>
              <div class="fans-count">100粉丝</div>
            </div>
          </div>
          <H5>UP主简介：</H5>
          <div class="uploader-desc">{{ videoInfo.introduction || '这个UP主很懒，还没有添加简介~' }}</div>
          <div v-if="isLogin && !isSelfVideo" class="button-group">
            <div class="follow-btn-wrapper"
                 @mouseenter="handleMouseEnter"
                 @mouseleave="handleMouseLeave"
            >
              <el-button
                  type="primary"
                  class="follow-btn"
                  :class="{ 'is-followed': isFollowed }"
                  @click="!isFollowed && handleFollow()"
              >
                <img :src="isFollowed ? Unfollow : concernIcon" class="follow-icon" alt="关注"/>
                {{ isFollowed ? '已关注' : '关注' }}
              </el-button>
              <div class="unfollow-dropdown"
                   v-show="showUnfollow"
                   @click="handleFollow"
              >
                <el-icon>
                  <Close/>
                </el-icon>
                取消关注
              </div>
            </div>
            <el-button class="message-btn" @click="goToChat">
              <el-icon>
                <ChatDotRound/>
              </el-icon>
              私信
            </el-button>
          </div>
        </div>

        <!-- 添加弹幕列表 -->
        <DanmakuList :videoId="videoId"/>

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
import {computed, onMounted, onUnmounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {getVideoDetailService} from '@/api/video' // 假设你会创建这个API服务
import {ChatDotRound, ChatRound, Close} from '@element-plus/icons-vue'
import VideoPlayer from '@/components/video/VideoPlayer.vue'
import {ElMessage} from "element-plus";
import useUserInfoStore from '@/stores/userInfo'
import UploaderIcon from '@/components/icons/UploaderIcon.vue'
import {addCommentService, getCommentsService} from "@/api/comments";
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import EmojiPicker from '@/components/EmojiPicker.vue'
import {useTokenStore} from '@/stores/token'
import eventBus from '@/utils/eventBus'
import DanmakuList from '@/components/video/DanmakuList.vue'
import {formatDate} from "@/utils/format";
import {followUserService, getUserFollowService} from '@/api/user/userfollow'
import {useTitle} from '@vueuse/core' // 如果没有安装这个库，也可以直接操作 document.title
import LikeIcon from '@/assets/iconsvg/like.svg'
import StarIcon from '@/assets/iconsvg/star.svg'
import CoinIcon from '@/assets/iconsvg/投币.svg'
import concernIcon from '@/assets/iconsvg/关注.svg'
import Unfollow from '@/assets/iconsvg/我的关注.svg'
import {userActionService, getVideoLikeService} from "@/api/user/uservideo";


// 配置 dayjs
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

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
  likesCount: 0,// 视频点赞数
  commentCount: 0,//评论数
  nickname: '',//作者昵称
  userPic: '',//作者头像
  username: '',//作者用户名
})

// 设置页面标题
const title = useTitle()
watch(() => videoInfo.value, (newVideo) => {
  if (newVideo && newVideo.title) {
    title.value = `${newVideo.title} - 哔哩哔哩` // 设置标题格式：视频标题 - 网站名
  } else {
    title.value = '哔哩哔哩' // 如果没有视频信息则显示默认标题
  }
}, {immediate: true})

// 组件卸载时恢复默认标题
onUnmounted(() => {
  title.value = '哔哩哔哩'
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
      if (isLogin.value) {
        await Promise.all([
          checkFollowStatus(),
          checkInteractionStatus('like'),
          checkInteractionStatus('favorite')
        ])
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
const comments = ref([])

// 推荐视频
const recommendVideos = ref([])

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
const emojiPosition = ref({top: '40px', left: '0px'})

// 处理表情点击
const handleEmojiClick = (event) => {
  event.stopPropagation()  // 阻止事件冒泡
  showEmojiPicker.value = !showEmojiPicker.value
  if (showEmojiPicker.value) {
    // 计算弹窗位置
    const emojiButton = event.currentTarget
    const rect = emojiButton.getBoundingClientRect()
    emojiPosition.value = {
      top: rect.height + 'px',  // 位于按钮正下方
      left: '0px'
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
    query: {username: videoInfo.value.username}
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
  await followUserService(videoInfo.value.userId, !isFollowed.value)
  isFollowed.value = !isFollowed.value
  ElMessage.success(isFollowed.value ? '关注成功' : '已取消关注')
}

// 监听登录状态变化
watch(isLogin, (newVal) => {
  if (newVal && videoInfo.value.userId) {
    checkFollowStatus()
  } else {
    isFollowed.value = false
  }
})

// 统一的互动状态管理
const interactionStates = ref({
  like: false,
  favorite: false
})

// 统一的互动状态检查方法
const checkInteractionStatus = async (action) => {
  try {
    if (!videoInfo.value.id) return
    
    const result = await getVideoLikeService(videoInfo.value.id, action)
    if (result.code === 200) {
      interactionStates.value[action] = result.data === true
    }
  } catch (error) {
    console.error(`获取${action}状态失败:`, error)
  }
}

// 统一的互动处理方法
const handleInteraction = async (action, countField) => {
  if (!isLogin.value) {
    eventBus.emit('showLogin')
    return
  }
  
  try {
    const result = await userActionService(videoInfo.value.id, action)
    if (result.code === 200) {
      interactionStates.value[action] = !interactionStates.value[action]
      
      // 如果需要更新计数
      if (countField) {
        videoInfo.value[countField] = interactionStates.value[action]
          ? (videoInfo.value[countField] || 0) + 1
          : (videoInfo.value[countField] || 1) - 1
      }
      
      ElMessage.success(result.data)
    }
  } catch (error) {
    console.error(`${action}操作失败:`, error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 添加互动状态
const showUnfollow = ref(false)

const hideTimer = ref(null)

const handleMouseEnter = () => {
  if (hideTimer.value) {
    clearTimeout(hideTimer.value)
    hideTimer.value = null
  }
  showUnfollow.value = isFollowed.value
}

const handleMouseLeave = () => {
  hideTimer.value = setTimeout(() => {
    showUnfollow.value = false
  }, 100) // 添加100ms延迟
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (hideTimer.value) {
    clearTimeout(hideTimer.value)
  }
})

// 添加跳转到用户主页的方法
const goToUserHome = () => {
  if (videoInfo.value && videoInfo.value.username) {
    router.push({
      path: '/user',
      query: {username: videoInfo.value.username}
    })
  }
}

// 修改监听器
watch(isLogin, async (newVal) => {
  if (newVal && videoInfo.value.id) {
    await Promise.all([
      checkInteractionStatus('like'),
      checkInteractionStatus('favorite')
    ])
  } else {
    interactionStates.value = {
      like: false,
      favorite: false
    }
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
  max-width: 2160px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 40px;
  padding: 0 20px;
  transition: all 0.3s ease-in-out;
}

.main-content.collapsed {
  grid-template-columns: 1fr 0;
  max-width: none;
  padding: 0;
}

/* 视频区域样式 */
.video-section {
  width: 100%;
  position: relative;
  transition: all 0.3s ease-in-out;
  min-width: 0;
  max-width: 1760px;
  margin: 0 auto;
  padding: 0;
}

/* 右侧区域样式 */
.recommend-section {
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  width: 380px;
  padding-top: 20px;
  height: calc(100vh - 80px);
  overflow-y: auto;
}

.recommend-section.is-collapsed {
  transform: translateX(100%);
  opacity: 0;
  width: 0;
  padding: 0;
  margin: 0;
}

/* 宽屏模式下的右侧区域样式 */
.collapsed .video-section {
  max-width: none;
  margin: 0;
}

.collapsed .recommend-section:not(.is-collapsed) {
  position: fixed;
  right: 0;
  top: 60px;
  width: 400px;
  height: calc(100vh - 60px);
  background: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 1999;
  padding: 20px;
  margin: 0;
  transform: none;
  opacity: 1;
}

/* 响应式布局调整 */
@media screen and (max-width: 2160px) {
  .main-content {
    max-width: 1920px;
  }

  .video-section {
    max-width: 1520px;
  }
}

@media screen and (max-width: 1920px) {
  .main-content {
    max-width: 1760px;
  }

  .video-section {
    max-width: 1360px;
  }
}

@media screen and (max-width: 1760px) {
  .main-content {
    max-width: 1600px;
  }

  .video-section {
    max-width: 1200px;
  }
}

@media screen and (max-width: 1600px) {
  .main-content {
    max-width: 1400px;
  }

  .video-section {
    max-width: 1000px;
  }
}

@media screen and (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 0 10px;
    max-width: 1000px;
  }

  .video-section {
    padding: 0;
  }

  .recommend-section {
    width: 100%;
    padding-top: 0;
  }

  /* 移动端宽屏模式下隐藏右侧区域 */
  .collapsed .recommend-section:not(.is-collapsed) {
    display: none;
  }
}

@media screen and (max-width: 768px) {
  .main-content {
    gap: 10px;
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
  cursor: pointer;
}

.uploader-info:hover .nickname {
  color: #fb7299;
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

.follow-btn-wrapper {
  flex: 2;
  position: relative;
}

.follow-btn {
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #00aeec;
  border: 1px solid #00aeec;
  color: #fff;

  &:hover {
    background: #33bfef;
    border-color: #33bfef;
    color: #fff;
    transform: translateY(-1px);
  }

  &.is-followed {
    background-color: #fff;
    border: 1px solid #e3e5e7;
    color: #61666d;

    .follow-icon {
      filter: brightness(0.6);
    }
  }

  .follow-icon {
    width: 16px;
    height: 16px;
    margin-right: 4px;
    filter: brightness(100);
  }

  &.is-followed .follow-icon {
    filter: brightness(0.6);
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

  .follow-btn {
    &:not(.is-followed) {
      background: #00aeec;
      border-color: #00aeec;
      color: #fff;

      &:hover {
        background: #33bfef;
        border-color: #33bfef;
      }

      .follow-icon {
        filter: brightness(100);
      }
    }

    &.is-followed {
      background-color: #2c2d30;
      border-color: #363739;
      color: #e5e7eb;

      .follow-icon {
        filter: brightness(2);
      }
    }
  }

  .follow-btn {
    &.is-followed .follow-icon {
      filter: brightness(2);
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
  position: relative;
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

/* 添加视频信息区域样式 */
.video-info {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.video-title {
  font-size: 20px;
  font-weight: 600;
  color: #18191c;
  margin-bottom: 8px;
  line-height: 1.4;
  padding: 0 16px;
  margin-top: -4px;
}

.video-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9499a0;
  font-size: 14px;
  margin-bottom: 20px;
  padding: 0 16px;
}

.bullet {
  color: #9499a0;
  margin: 0 4px;
}

/* 视频简介样式 */
.video-description {
  background: #f6f7f8;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.description-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #18191c;
  font-weight: 500;
}

.description-content {
  color: #61666d;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .video-info {
    background: #232427;
  }

  .video-title {
    color: #e5e7eb;
  }

  .video-description {
    background: #18191c;
  }

  .description-header {
    color: #e5e7eb;
  }

  .description-content {
    color: #9499a0;
  }
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .video-info {
    padding: 16px;
    border-radius: 0;
  }

  .video-title {
    font-size: 18px;
    margin-top: 0;
  }

  .video-description {
    padding: 12px;
  }
}

/* 添加互动按钮样式 */
.video-actions {
  display: flex;
  gap: 16px;
  padding: 16px;
  margin-top: 12px;
  border-bottom: 1px solid #f1f2f3;
}

.action-item {
  display: flex;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #61666d;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.action-icon {
  width: 38px;
  height: 38px;
  transition: all 0.3s ease;
  margin-right: 4px;
}

/* 激活状态下的图标颜色 */
.action-btn.is-active .action-icon {
  /* 蓝色滤镜 (#00a1d6) */
  filter: invert(47%) sepia(87%) saturate(1654%) hue-rotate(165deg) brightness(99%) contrast(96%);
}

/* 悬浮状态下的图标颜色 */
.action-btn:hover .action-icon {
  /* 蓝色滤镜 (#00a1d6) */
  filter: invert(47%) sepia(87%) saturate(1654%) hue-rotate(165deg) brightness(99%) contrast(96%);
}

.action-btn:hover {
  color: #00a1d6;
}

.action-btn.is-active {
  color: #00a1d6;
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .action-btn {
    background: transparent;
    color: #e5e7eb;
  }

  .action-btn:hover {
    color: #00a1d6;
  }

  .action-btn.is-active {
    color: #00a1d6;
  }
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .video-actions {
    padding: 12px;
    gap: 8px;
  }

  .action-btn {
    padding: 10px 20px;
    font-size: 15px;
    gap: 10px;
  }

  .action-icon {
    width: 28px;
    height: 28px;
    margin-right: 2px;
  }
}

.unfollow-dropdown {
  position: absolute;
  top: calc(100% - 1px);
  left: 0;
  right: 0;
  margin-top: 4px;
  padding: 8px;
  background: #fff;
  border: 1px solid #e3e5e7;
  border-radius: 8px;
  color: #61666d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background-color: #f4f5f7;
    border-color: #e3e5e7;
    color: #18191c;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .unfollow-dropdown {
    background-color: #2c2d30;
    border-color: #363739;
    color: #e5e7eb;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

    &:hover {
      background-color: #363739;
      border-color: #4a4b4d;
      color: #fff;
    }
  }
}

.clickable {
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.clickable:hover {
  opacity: 0.8;
}

/* 优化滚动条样式 */
.recommend-section::-webkit-scrollbar {
  width: 6px;
}

.recommend-section::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.recommend-section::-webkit-scrollbar-track {
  background-color: transparent;
}

/* 视频信息和UP主信息的布局容器 */
.info-wrapper {
  display: block;
  margin-top: 16px;
}

.info-wrapper.wide-screen {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  padding: 0 24px;
}

/* 视频内容区域样式 */
.video-content {
  flex: 1;
  min-width: 0;
  max-width: calc(100% - 392px); /* 360px + 32px gap */
}

/* UP主信息区域样式 */
.uploader-info-section {
  width: 360px;
  flex-shrink: 0;
}

/* 宽屏模式下的UP主卡片样式 */
.wide-screen .uploader-card {
  position: sticky;
  top: 20px;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .info-wrapper.wide-screen {
    flex-direction: column;
    gap: 16px;
  }

  .uploader-info-section {
    width: 100%;
  }

  .video-content {
    max-width: none;
  }

  .wide-screen .uploader-card {
    position: static;
    border-radius: 0;
    box-shadow: none;
    border-top: 1px solid #f1f2f3;
    border-bottom: 1px solid #f1f2f3;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .wide-screen .uploader-card {
    background: #18191c;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}
</style> 