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
            <span class="view-count">{{ videoInfo.viewCount }}播放</span>
            <span class="bullet">·</span>
            <span class="date">发布时间：{{ videoInfo.createTime }}</span>
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
          
          <!-- 评论列表 -->
          <div class="comment-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <el-avatar :size="40" :src="comment.avatar" />
              <div class="comment-content">
                <div class="comment-user">{{ comment.nickname }}</div>
                <div class="comment-text">{{ comment.content }}</div>
                <div class="comment-info">
                  <span class="comment-time">{{ comment.createTime }}</span>
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
          <div class="uploader-desc">{{ videoInfo.description || '这个UP主很懒，还没有添加简介~' }}</div>
          <el-button type="primary" class="follow-btn" block>
            <el-icon><Plus /></el-icon>
            关注
          </el-button>
        </div>

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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getVideoDetailService } from '@/api/video' // 假设你会创建这个API服务
import { VideoPlay, Plus, ChatDotRound, CaretRight } from '@element-plus/icons-vue'
import VideoPlayer from '@/components/video/VideoPlayer.vue'
import {ElMessage} from "element-plus";

const route = useRoute()
// 视频详情数据模型
const videoInfo = ref({
  id: 0,
  title: '',//视频标题
  cover: '',//封面地址
  videoUrl: '',//视频地址
  viewCount: '',//播放量
  createTime: '',//创建时间
  content: '',//视频简介
  commentCount: 0,//评论数
  nickname: '',//作者昵称
  userPic: '',//作者头像
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
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
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
</script>

<style scoped>
.video-detail {
  min-height: 100vh;
  background-color: #f1f2f3;
  padding: 20px 0;
}

.main-content {
  position: relative;
  max-width: 1400px;
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
}

/* 确保视频播放器响应式 */
.video-section :deep(.video-player) {
  width: 100%;
  transition: all 0.3s ease-in-out;
}

.video-info {
  padding: 20px 0;
  border-bottom: 1px solid #e3e5e7;
}

.video-title {
  font-size: 20px;
  font-weight: bold;
  color: #18191c;
  margin: 0 0 12px;
}

.video-stats {
  color: #9499a0;
  font-size: 14px;
}

.bullet {
  margin: 0 8px;
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

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-user {
  font-size: 14px;
  font-weight: 500;
  color: #18191c;
  margin-bottom: 6px;
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

.follow-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #fb7299;
  border-color: #fb7299;
  font-size: 14px;
}

.follow-btn:hover {
  background: #fc8bab;
  border-color: #fc8bab;
}

@media screen and (max-width: 1200px) {
  .main-content {
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
</style> 