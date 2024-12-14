<script setup>
import { ref, onMounted } from 'vue'
import {getVideoListService} from "@/api/video";
import { VideoPlay } from '@element-plus/icons-vue'

// 视频列表数据模型
const videos = ref([
  {
    id: 1,
    title: '示例视频标题1',
    cover: 'https://example.com/cover1.jpg',
    uploader: {
      id: 1,
      nickname: 'UP主1'
    },
    playCount: 12000,
    createTime: '2024-03-20'
  },
  {
    id: 1,
    title: '示例视频标题1',
    cover: 'https://example.com/cover1.jpg',
    uploader: {
      id: 1,
      nickname: 'UP主1'
    },
    playCount: 12000,
    createTime: '2024-03-20'
  }
])

// 轮播图数据模型
const carouselItems = ref([
  {
    id: 1,
    title: '推荐内容1',
    image: 'https://play.xfvod.pro/images/hb/wtdhz.png',
    link: '/video/1'
  },
  {
    id: 1,
    title: '推荐内容2',
    image: 'https://play.xfvod.pro/images/hb/baiquan.jpg',
    link: '/video/1'
  },
  {
    id: 1,
    title: '推荐内容3',
    image: 'https://play.xfvod.pro/images/hb/lx.jpg',
    link: '/video/1'
  }
])

//调用获取视频列表数据接口
const getVideoList = async () => {
  const res = await getVideoListService()
  videos.value = res.data
}
getVideoList()
</script>

<template>
  <div class="home">
    <!-- 轮播图区域 -->
    <div class="carousel-wrapper">
      <el-carousel height="500px" class="carousel-container" :interval="4000">
        <el-carousel-item v-for="item in carouselItems" :key="item.id" class="carousel-item">
          <div class="carousel-content">
            <img :src="item.image" :alt="item.title" class="carousel-image">
            <div class="carousel-overlay">
              <h3 class="carousel-title">{{ item.title }}</h3>
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

    <!-- 主要内容区域 -->
    <div class="main-content">
      <el-row :gutter="20">
          <div class="content-section">
            <!-- 视频列表 -->
            <div class="video-grid">
              <el-card v-for="video in videos" :key="video.id" class="video-card" @click="handleVideoClick(video)">
                <div class="video-thumbnail">
                  <img :src="video.cover" :alt="video.title" class="cover-image">
                </div>
                <div class="video-title">{{ video.title }}</div>
                <div class="video-info">
                  <span class="uploader">UP主: lwz</span>
                  <span class="play-count">播放: 10000 万</span>
                </div>
              </el-card>
            </div>
          </div>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding-bottom: 20px;
}

.carousel-wrapper {
  width: 100%;
  margin-bottom: 20px;
  background-color: #f6f7f8;
  padding: 20px 0;
  max-width: 1600px;
  margin: 0 auto;
}

.carousel-container {
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-width: 1600px;
  margin: 0 auto;
  border-radius: 12px;
}

.carousel-item {
  overflow: hidden;
  border-radius: 12px;
}

.carousel-content {
  position: relative;
  height: 100%;
  transition: transform 0.3s ease;
  overflow: hidden;
  border-radius: 12px;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  object-position: center center;
  border-radius: 12px;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

.content-section {
  margin-top: 20px;
}

.video-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  max-width: 1600px;
  margin: 0 auto;
}

.video-card {
  margin-bottom: 15px;
  overflow: hidden;
  border-radius: 6px;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 200px;
}

.video-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-thumbnail {
  height: 160px;
  background-color: #f5f5f5;
  margin-bottom: 8px;
  overflow: hidden;
  border-radius: 4px;
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
}

.video-info {
  font-size: 12px;
  color: #999;
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
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
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: #fff;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.carousel-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
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

:deep(.el-carousel__indicators) {
  bottom: 40px;
}

:deep(.el-carousel__button) {
  width: 24px;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 2px;
  transition: all 0.3s ease;
}

:deep(.el-carousel__indicator.is-active .el-carousel__button) {
  background-color: #fb7299;
}

:deep(.el-carousel__arrow) {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 20px;
  transition: all 0.3s ease;
}

:deep(.el-carousel__arrow:hover) {
  background-color: rgba(251, 114, 153, 0.9);
}

@media screen and (max-width: 1200px) {
  .carousel-container {
    height: 400px !important;
  }

  .carousel-title {
    font-size: 24px;
  }

  .carousel-overlay {
    padding: 30px;
  }
}

@media screen and (max-width: 768px) {
  .carousel-container {
    height: 350px !important;
  }

  .carousel-title {
    font-size: 20px;
    margin-bottom: 12px;
  }

  .carousel-overlay {
    padding: 20px;
  }

  .play-icon {
    padding: 6px 16px;
    font-size: 14px;
  }

  :deep(.el-carousel__indicators) {
    bottom: 20px;
  }
}

@media screen and (max-width: 1600px) {
  .video-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media screen and (max-width: 1400px) {
  .video-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .main-content {
    padding: 0 30px;
  }
}

@media screen and (max-width: 1200px) {
  .video-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .main-content {
    padding: 0 20px;
  }

  .video-thumbnail {
    height: 180px;
  }
}
</style> 