<script setup>
import { ref, onMounted } from 'vue'
import {getVideoListService} from "@/api/video";

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
    image: 'https://example.com/banner1.jpg',
    link: '/video/1'
  },
  {
    id: 1,
    title: '推荐内容2',
    image: 'https://example.com/banner1.jpg',
    link: '/video/1'
  },
  {
    id: 1,
    title: '推荐内容3',
    image: 'https://example.com/banner1.jpg',
    link: '/video/1'
  }
])

// 排行榜数据模型
const rankList = ref([
  {
    id: 1,
    title: '热门视频1',
    playCount: 15000,
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
    <el-row :gutter="20">
      <el-col :span="18">
        <div class="content-section">
          <!-- 轮播图 -->
          <el-carousel height="300px">
            <el-carousel-item v-for="item in carouselItems" :key="item.id">
              <div class="carousel-content">
                <img :src="item.image" :alt="item.title" class="carousel-image">
                <div class="carousel-title">{{ item.title }}</div>
              </div>
            </el-carousel-item>
          </el-carousel>
          
          <!-- 视频列表 -->
          <div class="video-grid">
            <el-card v-for="video in videos" :key="video.id" class="video-card">
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
      </el-col>
      
      <!-- 排行榜 -->
      <el-col :span="6">
        <div class="sidebar">
          <el-card class="rank-card">
            <template #header>
              <div class="rank-header">排行榜</div>
            </template>
            <div v-for="(item, index) in rankList" :key="item.id" class="rank-item">
              <span class="rank-num" :class="{ 'top3': index < 3 }">{{ index + 1 }}</span>
              <span class="rank-title">{{ item.title }}</span>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.home {
  padding: 20px;
}

.carousel-content {
  height: 100%;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
}

.video-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.video-card {
  margin-bottom: 15px;
}

.video-thumbnail {
  height: 120px;
  background-color: #f5f5f5;
  margin-bottom: 8px;
}

.video-title {
  font-size: 14px;
  margin-bottom: 8px;
}

.video-info {
  font-size: 12px;
  color: #999;
  display: flex;
  justify-content: space-between;
}

.rank-item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.rank-num {
  margin-right: 10px;
  color: #999;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: #fff;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
</style> 