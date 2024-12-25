<template>
  <div class="anime">
    <!-- 轮播图区域 -->
    <div class="banner-section">
      <el-carousel 
        :interval="5000" 
        arrow="never"
        height="480px"
        trigger="click"
        @change="handleSlideChange"
        :autoplay="false"
        ref="carouselRef"
      >
        <el-carousel-item v-for="(item, index) in bannerList" :key="index">
          <div class="banner-content">
            <img :src="item.coverImage" :alt="item.title" class="banner-image">
          </div>
        </el-carousel-item>
      </el-carousel>

      <!-- 底部缩略图 -->
      <div class="thumbnail-list">
        <div
          v-for="(item, index) in bannerList"
          :key="index"
          class="thumbnail-item"
          :class="{ 'active': currentIndex === index }"
          @mouseenter="handleThumbnailHover(index)"
        >
          <img :src="item.coverImage" :alt="item.title">
          <div class="thumbnail-title">{{ item.title }}</div>
          <div
            v-if="currentIndex === index"
            class="progress-bar"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 番剧热播榜 -->
    <div class="hot-anime-section">
      <div class="section-header">
        <div class="title">
          <img class="title-icon" src="http://sowl9rtuo.hn-bkt.clouddn.com/huohua.png" alt="hot">
          番剧热播榜
        </div>
        <div class="more">
          查看全部 <i class="el-icon-arrow-right"></i>
        </div>
      </div>

      <div class="hot-anime-list">
        <div v-for="(item, index) in hotAnimeList"
          :key="index"
          class="hot-anime-item"
        >
          <div class="anime-cover">
            <img :src="item.coverImage" :alt="item.title">
            <div class="score">{{ item.score }}</div>
          </div>
          <div class="anime-info">
            <div class="rank-number">{{ index + 1 }}</div>
            <div class="info-content">
              <div class="title">{{ item.title }}</div>
              <div class="desc">{{ item.currentEpisode }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, onMounted } from 'vue'
import {getBannerService} from "@/api/anime";

const activeTab = ref('recommended')
const currentIndex = ref(0)
const carouselRef = ref(null)
const progress = ref(0)
let progressTimer = null
let autoplayTimer = null

// 轮播图数据
const bannerList = ref([

])
// 热播榜数据
const hotAnimeList = ref([
  {
    title: '夏目友人帐 第七��',
    currentEpisode: '浪漫之旅的起点',
    score: '9.9',
    coverImage: 'https://play.xfvod.pro/images/hb/ddd.webp'
  },
  {
    title: '夏目友人帐 第七季',
    currentEpisode: '浪漫之旅的起点',
    score: '9.9',
    coverImage: 'https://play.xfvod.pro/images/hb/ddd.webp'
  }
])

// 处理轮播图切换
const handleSlideChange = (index) => {
  currentIndex.value = index
  resetProgress()
}

// 处理缩略图悬停
const handleThumbnailHover = (index) => {
  currentIndex.value = index
  carouselRef.value?.setActiveItem(index)
  resetProgress()
}

// 重置并开始进度条
const resetProgress = () => {
  progress.value = 0
  clearInterval(progressTimer)
  clearInterval(autoplayTimer)

  progressTimer = setInterval(() => {
    progress.value += 2  // 每100ms增加2%，总共5000ms
    if (progress.value >= 100) {
      progress.value = 0
      goToNextSlide()
    }
  }, 100)
}

// 切换到下一张图片
const goToNextSlide = () => {
  const nextIndex = (currentIndex.value + 1) % bannerList.value.length
  handleThumbnailHover(nextIndex)
}

// 开始自动播放
const startAutoplay = () => {
  autoplayTimer = setInterval(() => {
    goToNextSlide()
  }, 5000)
}

// 组件挂载时启动自动播放
onMounted(() => {
  startAutoplay()
  resetProgress()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  clearInterval(progressTimer)
  clearInterval(autoplayTimer)
})
//获取轮播图内容
const getBannerList = async () => {
    const res = await getBannerService()
    bannerList.value = res.data
}
getBannerList()


// 获取热播榜数据

</script>

<style scoped>

.anime-cover {
  height: 250px;
  background-color: #f5f5f5;
  margin-bottom: 8px;
}

.anime-title {
  font-size: 14px;
  margin-bottom: 8px;
}

.anime-info {
  font-size: 12px;
  color: #999;
  display: flex;
  justify-content: space-between;
}

/* 轮播图区域样式 */
.banner-section {
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
  background-color: #f5f7fa;
  min-height: 520px;
}

.banner-content {
  position: relative;
  height: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 轮播图底部蒙版 */
.banner-section::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 180px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(245, 247, 250, 0.4) 40%,
    rgba(245, 247, 250, 0.95) 80%,
    rgba(245, 247, 250, 1)
  );
  pointer-events: none;
  z-index: 1;
}

/* 底部缩略图样式 */
.thumbnail-list {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: -80px;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.thumbnail-item {
  width: 200px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  transform-origin: center bottom;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 3px solid rgba(255, 255, 255, 0.8);
  border-top-width: 0;
}

.thumbnail-item img {
  width: 100%;
  height: 112px;
  object-fit: cover;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.thumbnail-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3),
    transparent
  );
  z-index: 2;
}

.progress-bar {
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  height: 4px;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.8)
  );
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  transition: width 0.1s ease-out;
  z-index: 3;
}

.thumbnail-item.active {
  transform: translateY(-10px) scale(1.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 2;
  border-color: #fff;
  border-top-width: 0;

  &::before {
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.4),
      transparent
    );
  }

  .progress-bar {
    height: 8px;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 1),
      rgba(255, 255, 255, 0.9)
    );
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .thumbnail-title {
    font-weight: 500;
  }
}

.thumbnail-item:not(.active) {
  filter: brightness(0.8);
  transform: scale(0.95);
  border-color: rgba(255, 255, 255, 0.6);
  border-top-width: 0;

  &::before {
    opacity: 0.8;
  }

  .progress-bar {
    opacity: 0.9;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.8),
      rgba(255, 255, 255, 0.6)
    );
  }
}

.thumbnail-item:hover:not(.active) {
  border-color: rgba(255, 255, 255, 0.9);
  border-top-width: 0;

  &::before {
    opacity: 0.9;
  }

  .progress-bar {
    opacity: 1;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.9),
      rgba(255, 255, 255, 0.7)
    );
  }
}

.thumbnail-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  font-size: 14px;
  color: #fff;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(0, 0, 0, 0.5) 30%,
    rgba(0, 0, 0, 0.8)
  );
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  z-index: 2;
}

/* 整轮播图高度 */
:deep(.el-carousel) {
  height: 520px;
}

/* 番剧热播榜样式 */
.hot-anime-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header .title {
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
}

.section-header .more {
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
  font-size: 14px;
}

.section-header .more:hover {
  color: #ff6b6b;
}

.hot-anime-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.hot-anime-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.rank-number {
  font-size: 28px;
  font-weight: 600;
  color: #ff6b6b;
  line-height: 1;
  z-index: 1;
  min-width: 32px;
  text-align: center;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.anime-cover {
  position: relative;
  height: 240px;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
  aspect-ratio: 3/4;
}

.anime-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.score {
  position: absolute;
  bottom: 8px;
  right: 8px;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.anime-info {
  padding: 16px;
  background: #fff;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.anime-info .title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
  margin-bottom: 4px;
}

.anime-info .desc {
  font-size: 14px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.hot-anime-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.hot-anime-item:hover img {
  transform: scale(1.05);
}

/* 前三名特殊样式 */
.hot-anime-item:nth-child(1) .rank-number {
  font-size: 28px;
  color: #ff6b6b;
}

.hot-anime-item:nth-child(2) .rank-number {
  color: #047edf;
}

.hot-anime-item:nth-child(3) .rank-number {
  color: #7c4dff;
}

/* 添加图片遮罩 */
.anime-cover::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(0, 0, 0, 0.4)
  );
  pointer-events: none;
}

.title-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
  vertical-align: middle;
}
</style>