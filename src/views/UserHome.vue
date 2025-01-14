<template>
  <div class="user-home">
    <!-- 顶部背景和用户信息 -->
    <div class="user-header">
      <div class="header-bg">
        <div class="bg-image" :style="{ backgroundImage: `url(${bgImage})` }"></div>
        <div class="bg-overlay"></div>
      </div>
      <div class="user-info-card">
        <div class="user-basic">
          <div class="avatar-wrap">
            <el-avatar :size="120" :src="userHomeInfo.userPic || defaultAvatar"/>
          </div>
          <div class="user-detail">
            <h1 class="username">{{ userHomeInfo.nickname }}</h1>
            <div class="user-stats">
              <div class="stat-item">
                <span class="num">{{ userHomeInfo.followCount || 0 }}</span>
                <span class="label">关注</span>
              </div>
              <div class="stat-item">
                <span class="num">{{ userHomeInfo.fansCount || 0 }}</span>
                <span class="label">粉丝</span>
              </div>
              <div class="stat-item">
                <span class="num">{{ userHomeInfo.videoCount || 0 }}</span>
                <span class="label">投稿</span>
              </div>
            </div>
            <div class="user-sign">{{ userHomeInfo.introduction || '这个人很懒，什么都没写~' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户内容区域 -->
    <div class="user-content">
      <div class="content-tabs">
        <div class="tab active"><img :src="videoIcon" alt="视频">发布的视频</div>
        <div class="tab"><img :src="dynamicIcon" alt="动态">动态</div>
        <div class="tab"><img :src="starIcon" alt="收藏">收藏</div>
      </div>
      <!-- 视频列表 -->
      <div class="video-list" v-if="userHomeInfo.videos && userHomeInfo.videos.length > 0">
        <div v-for="video in userHomeInfo.videos" 
             :key="video.id" 
             class="video-item"
             @click="goToVideo(video.id)">
          <div class="video-cover">
            <img :src="video.cover" :alt="video.title">
            <span class="duration">{{ video.duration }}</span>
          </div>
          <div class="video-info">
            <div class="video-title">{{ video.title }}</div>
            <div class="video-stats">
              <span>{{ video.viewCount }}播放</span>
              <span class="dot">·</span>
              <span>{{ video.createTime }}</span>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无视频"/>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {userHomeService} from '@/api/user/user'
import {useRouter} from 'vue-router'
import bgImage from '@/assets/背景图/背景图.webp' // 导入背景图片
//图标
import videoIcon from '@/assets/iconsvg/video.svg'
import starIcon from '@/assets/iconsvg/userstar.svg'
import dynamicIcon from '@/assets/iconsvg/dynamic.svg'

const userHomeInfo = ref({})
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const router = useRouter()

// 获取用户首页信息
const getUserHomeInfo = async () => {
  const res = await userHomeService()
  userHomeInfo.value = res.data
}

// 跳转到视频播放页
const goToVideo = (videoId) => {
  router.push(`/video/${videoId}`)
}

onMounted(() => {
  getUserHomeInfo()
})
</script>

<style scoped>
.user-home {
  min-height: 100vh;
  background: #f6f7f8;
  margin-top: -64px;
}

.user-header {
  position: relative;
  height: 240px;
  overflow: hidden;
  padding-top: 64px;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: all 0.3s ease;
  transform: scale(1.1);
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
}

.user-info-card {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 20px 40px;
  color: #fff;
}

.user-basic {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 40px;
}

.avatar-wrap {
  position: relative;
}

.user-detail {
  flex: 1;
  margin-bottom: 20px;
}

.username {
  font-size: 28px;
  margin-bottom: 16px;
}

.user-stats {
  display: flex;
  gap: 32px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item .num {
  font-size: 24px;
  font-weight: bold;
}

.stat-item .label {
  font-size: 14px;
  opacity: 0.8;
}

.user-sign {
  font-size: 14px;
  opacity: 0.9;
}

.user-content {
  margin: 0 auto;
  width: 100%;
}

.content-tabs {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e3e5e7;
  max-width: 1200px;
  margin-left: 40px;
}

.tab {
  padding: 12px 0;
  font-size: 16px;
  color: #61666d;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab img {
  width: 35px;
  height: 30px;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.tab:hover img {
  opacity: 0.8;
}

.tab.active img {
  opacity: 1;
}

.tab.active {
  color: #18191c;
  font-weight: 500;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #fb7299;
}

.video-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 2000px;
  margin: 0 auto;
  padding: 0 40px;
}

.video-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
}

.video-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-cover {
  position: relative;
  padding-top: 56.25%;
}

.video-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
}

.video-info {
  padding: 12px;
}

.video-title {
  font-size: 14px;
  color: #18191c;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-stats {
  font-size: 12px;
  color: #9499a0;
}

.dot {
  margin: 0 6px;
}

@media screen and (max-width: 1700px) {
  .video-list {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media screen and (max-width: 1400px) {
  .video-list {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}

@media screen and (max-width: 1200px) {
  .content-tabs {
    margin-left: 30px;
  }
  .video-list {
    padding: 0 30px;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media screen and (max-width: 992px) {
  .video-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
}

@media screen and (max-width: 768px) {
  .user-header {
    height: 180px;
  }

  .user-basic {
    margin-top: 20px;
    flex-direction: column;
    text-align: center;
  }

  .user-stats {
    justify-content: center;
  }

  .content-tabs {
    gap: 16px;
    margin-left: 15px;
  }

  .video-list {
    padding: 0 15px;
    grid-template-columns: repeat(1, 1fr);
    gap: 12px;
  }

  .user-info-card {
    padding: 20px 20px 30px;
  }

  .video-title {
    font-size: 13px;
  }

  .video-stats {
    font-size: 11px;
  }
}
</style> 