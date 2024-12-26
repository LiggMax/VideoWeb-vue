<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {getVideoListService} from "@/api/video";
import { VideoPlay, CaretTop, ArrowUp, Refresh } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

// 添加 router 实例
const router = useRouter()

// 视频列表数据模型
const videos = ref([
])

// 轮播图数据模型
const carouselItems = ref([
  {
    id: 1,
    title: '我推的孩子',
    description: '16岁的天才少女星野爱久爱海梦想成为偶像，但在甄选会上却屡屡受挫...',
    image: 'https://play.xfvod.pro/images/hb/wtdhz.png',
    link: '/video/1'
  },
  {
    id: 1,
    title: '败犬女主太多了',
    description: '这是一段视频介绍文字，简单描述视���的主要内容...',
    image: 'https://play.xfvod.pro/images/hb/baiquan.jpg',
    link: '/video/1'
  },
  {
    id: 1,
    title: '青之箱',
    description: '这是另一段视频介绍文字，帮助用户了解视频内容...',
    image: 'https://play.xfvod.pro/images/hb/lx.jpg',
    link: '/video/1'
  },
  {
    id: 1,
    title: '缘结甘神家',
    description: '这是另一段视频介绍文字，帮助用户了解视频内容...',
    image: 'https://picgg.cycimg.me/banner/GXehBtTbYAALPbN-up2x.webp',
    link: '/video/1'
  }
])

// 计算轮播图高度
const carouselHeight = ref('800px')

// 更新轮播图高度的函数
const updateCarouselHeight = () => {
  const width = window.innerWidth
  let height

  if (width >= 1920) {
    height = width * 0.45 // 45% for large screens
  } else if (width >= 1440) {
    height = width * 0.5 // 50% for medium-large screens
  } else if (width >= 768) {
    height = width * 0.55 // 55% for medium screens
  } else {
    height = width * 0.6 // 60% for mobile screens
  }

  // 设置最小和最大高度限制
  height = Math.max(height, 700) // 最小高度 700px
  height = Math.min(height, 1080) // 最大高度 1080px

  carouselHeight.value = `${height}px`
}

//调用获取视频列表数据接口
const getVideoList = async () => {
  const res = await getVideoListService()
  videos.value = res.data
}
getVideoList()

// 添加视频点击处函数
const handleVideoClick = (video) => {
  router.push({
    path: `/video/${video.id}`,
    // 可选:通过 query 传递一些基础数据,减少详情页的首次加载等待
    query: {
      title: video.title,
      cover: video.cover
    }
  })
}

// 添加刷新方法
const handleRefresh = () => {
  window.location.reload()
}

// 监听窗口大小变化
onMounted(() => {
  updateCarouselHeight()
  window.addEventListener('resize', updateCarouselHeight)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', updateCarouselHeight)
})
</script>

<template>
  <div class="home">
    <!-- 轮播图区域 -->
    <div class="carousel-wrapper">
      <el-carousel
        :height="carouselHeight"
        class="carousel-container"
        :interval="4000"
        :indicator-position="'none'"
      >
        <el-carousel-item v-for="item in carouselItems" :key="item.id" class="carousel-item">
          <div class="carousel-content">
            <img :src="item.image" :alt="item.title" class="carousel-image">
            <div class="carousel-overlay">
              <h3 class="carousel-title">{{ item.title }}</h3>
              <p class="carousel-description">{{ item.description }}</p>
              <div class="carousel-info">
                <span class="play-icon">
                  <el-icon><VideoPlay /></el-icon>
                  立即观看
                </span>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <div class="main-content">
      <!-- 主要内容区域 -->
      <div class="content-section">
        <div class="section-title">
          <el-icon><VideoPlay /></el-icon>
          热门推荐
        </div>
        <!-- 视频列表 -->
        <div class="video-grid">
          <el-card v-for="video in videos" :key="video.id" class="video-card" @click="handleVideoClick(video)">
            <div class="video-thumbnail">
              <img :src="video.cover" :alt="video.title" class="cover-image">
            </div>
            <div class="video-title">{{ video.title }}</div>
            <div class="video-info">
              <span class="uploader">
                <span class="up-tag">UP：</span>
                <el-avatar :size="24" :src="video.userPic" />
                {{ video.nickname }}
              </span>
              <span class="play-count">播放: 10000 万</span>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 修改固定按钮组 -->
    <div class="fixed-buttons">
      <!-- 刷新按钮 -->
      <div class="action-button refresh-btn" @click="handleRefresh">
        <el-icon><Refresh /></el-icon>
      </div>

      <!-- 返回顶部按钮 -->
      <el-backtop
        :right="40"
        :bottom="100"
        :visibility-height="400"
        class="back-to-top"
      >
        <div class="back-top-content">
          <el-icon><ArrowUp /></el-icon>
        </div>
      </el-backtop>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding-bottom: 20px;
  width: 100%;
  min-height: 100vh;
  padding-top: 0;
}

.carousel-wrapper {
  width: 100%;
  margin: 0 auto;
  position: relative;
  margin-top: -64px;
  overflow: hidden;
}

.carousel-container {
  overflow: hidden;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.carousel-item {
  overflow: visible;
  border-radius: 0;
}

.carousel-content {
  position: relative;
  height: 100%;
  transition: transform 0.3s ease;
  overflow: visible;
  border-radius: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  object-position: center center;
}

.content-section {
  margin-top: 0;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 40px;
  box-sizing: border-box;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  color: #18191c;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.video-grid {
  margin-top: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 2400px;
  margin: 0 auto;
}

.video-card {
  margin-bottom: 15px;
  overflow: hidden;
  border-radius: 6px;
  transition: all 0.3s ease;
  cursor: pointer;
  text-align: center;
  width: 100%;
  height: 100%;
  min-width: 0;
}

.video-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-thumbnail {
  aspect-ratio: 16 / 9;
  background-color: #f5f5f5;
  margin-bottom: 8px;
  overflow: hidden;
  border-radius: 4px;
  width: 100%;
}

:deep(.el-card__body) {
  padding: 8px;
}

:deep(.el-card) {
  border-radius: 6px;
  overflow: hidden;
}

.video-title {
  font-size: 15px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  font-weight: 500;
  text-align: left;
}

.video-info {
  font-size: 12px;
  color: #999;
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
  text-align: left;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  border-radius: 4px;
}

.video-thumbnail:hover .cover-image {
  transform: scale(1.05);
}

.rank-item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.rank-num {
  margin-right: 10px;
  color: #999;
}

.uploader {
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.up-tag {
  color: #fb7299;
  font-weight: bold;
  font-size: 13px;
}

.play-count {
  color: #999;
}

.top3 {
  color: #fb7299;
  font-weight: bold;
}

.rank-header {
  font-size: 18px;
  font-weight: bold;
  color: #18191c;
}

.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px;
  padding-bottom: 120px;
  background: linear-gradient(
    transparent 0%,
    rgba(0, 0, 0, 0.2) 20%,
    rgba(0, 0, 0, 0.4) 40%,
    rgba(0, 0, 0, 0.7) 70%,
    rgba(0, 0, 0, 0.85) 100%
  );
  color: #fff;
  padding-top: 160px;
}

.carousel-title {
  font-size: 32px;
  font-weight: bold;
  margin: 0;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
}

.carousel-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.play-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #fb7299;
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-icon:hover {
  background-color: #fc8bab;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(251, 114, 153, 0.4);
}

:deep(.el-carousel__arrow) {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  z-index: 10;

  &.el-carousel__arrow--left {
    left: 40px;
  }

  &.el-carousel__arrow--right {
    right: 40px;
  }
}

:deep(.el-carousel__arrow:hover) {
  background-color: rgba(251, 114, 153, 0.9);
}

@media screen and (min-width: 2400px) {
  .video-grid {
    grid-template-columns: repeat(8, 1fr);
  }
}

@media screen and (max-width: 2000px) {
  .video-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media screen and (max-width: 1600px) {
  .video-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .content-section {
    padding: 0 30px;
  }
}

@media screen and (max-width: 1400px) {
  .video-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .content-section {
    padding: 0 30px;
  }
}

@media screen and (max-width: 1200px) {
  .video-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .content-section {
    padding: 0 20px;
  }
}

@media screen and (max-width: 900px) {
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-section {
    padding: 0 16px;
  }
}

@media screen and (max-width: 600px) {
  .video-grid {
    grid-template-columns: repeat(1, 1fr);
    gap: 12px;
  }

  .content-section {
    padding: 0 12px;
  }
}

/* 返回顶部按钮样式 */
.back-to-top {
  --el-backtop-bg-color: #fb7299;
  --el-backtop-text-color: #fff;
  --el-backtop-hover-bg-color: #fc8bab;
}

.back-top-content {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-top-content .el-icon {
  font-size: 20px;
}

:deep(.el-backtop) {
  background-color: var(--el-backtop-bg-color);
  color: var(--el-backtop-text-color);
  height: 44px;
  width: 44px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: static;
  transform: none;
}

:deep(.el-backtop:hover) {
  background-color: var(--el-backtop-hover-bg-color);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(251, 114, 153, 0.3);
}

.carousel-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 16px 0;
  line-height: 1.6;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 800px;
}

@media screen and (max-width: 1200px) {
  .carousel-title {
    font-size: 28px;
  }

  .carousel-description {
    font-size: 15px;
    margin-bottom: 12px;
  }
}

@media screen and (max-width: 768px) {
  .carousel-title {
    font-size: 24px;
  }

  .carousel-description {
    font-size: 14px;
    margin-bottom: 10px;
    -webkit-line-clamp: 1;
  }

  .carousel-overlay {
    padding: 120px 20px 100px;
  }
}

@media screen and (max-width: 600px) {
  .video-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
  }
}

/* 添加固定按钮组样式 */
.fixed-buttons {
  position: fixed;
  right: 40px;
  bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 999;
}

/* 通用按钮样式 */
.action-button {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background-color: #fb7299;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-button:hover {
  background-color: #fc8bab;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(251, 114, 153, 0.3);
}

.action-button .el-icon {
  font-size: 20px;
}

/* 修改返回顶部按钮置 */
:deep(.el-backtop) {
  position: static;
  transform: none;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .fixed-buttons {
    right: 20px;
    bottom: 20px;
    gap: 12px;
  }

  .action-button,
  :deep(.el-backtop) {
    width: 40px;
    height: 40px;
  }
}

.carousel-content-wrapper {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 40px;
  position: relative;
  z-index: 2;
}

@media screen and (max-width: 768px) {
  :deep(.el-carousel__arrow) {
    &.el-carousel__arrow--left {
      left: 20px;
    }

    &.el-carousel__arrow--right {
      right: 20px;
    }
  }

  .carousel-overlay {
    padding: 120px 20px 100px;
  }
}

.main-content {
  position: relative;
  z-index: 2;
  margin-top: -80px;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 40px 0 20px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

/* 优化轮播图渐变效果 */
.carousel-content::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 200px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
  pointer-events: none;
}
</style>