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
        ref="carouselRef"
      >
        <el-carousel-item v-for="(item, index) in bannerList" :key="index">
          <div class="banner-content">
            <img :src="item.cover" :alt="item.title" class="banner-image">
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
          <img :src="item.cover" :alt="item.title">
          <div class="thumbnail-title">{{ item.title }}</div>
        </div>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="anime-tabs">
      <el-tab-pane label="推荐" name="recommended">
        <div class="anime-grid">
          <el-card v-for="n in 12" :key="n" class="anime-card">
            <div class="anime-cover"></div>
            <div class="anime-title">番剧标题 {{ n }}</div>
            <div class="anime-info">
              <span>更新至第12话</span>
              <span>9.2分</span>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="连载动画" name="series">
        连载动画内容
      </el-tab-pane>
      
      <el-tab-pane label="完结动画" name="finished">
        完结动画内容
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('recommended')
const currentIndex = ref(0)
const carouselRef = ref(null)

// 静态轮播图数据
const bannerList = ref([
  {
    title: '神之塔 工房战',
    description: '第4话 酷炫的战斗场景，精彩的剧情发展',
    cover: 'https://play.xfvod.pro/images/hb/img_kv-02.webp'
  },
  {
    title: '夏目友人帐 第七季',
    description: '温暖人心的故事继续',
    cover: 'https://play.xfvod.pro/images/hb/lx.jpg'
  },
  {
    title: '咒术回战 第二季',
    description: '五条悟的过去篇章',
    cover: 'https://play.xfvod.pro/images/hb/ddd.webp'
  },
  {
    title: '青之源流',
    description: '全新原创动画',
    cover: 'https://play.xfvod.pro/images/hb/re02.jpg'
  },
  {
    title: '坂本日常',
    description: '日常生活中的搞笑故事',
    cover: 'https://play.xfvod.pro/images/hb/wtdhz.png'
  },
  {
    title: '盾之勇者成名录',
    description: '第三季正在热播中',
    cover: 'https://play.xfvod.pro/images/hb/baiquan.jpg'
  },
  {
    title: '精灵幻想记',
    description: '奇幻冒险启程',
    cover: 'https://play.xfvod.pro/images/hb/img_kv-02.webp'
  }
])

// 处理轮播图切换
const handleSlideChange = (index) => {
  currentIndex.value = index
}

// 处理缩略图悬停
const handleThumbnailHover = (index) => {
  currentIndex.value = index
  // 设置轮播图到对应索引
  carouselRef.value?.setActiveItem(index)
}
</script>

<style scoped>
.anime {
  padding: 20px;
}

.anime-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.anime-card {
  margin-bottom: 15px;
}

.anime-cover {
  height: 150px;
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

/* 底部缩略图样式 */
.thumbnail-list {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: -60px;
  padding: 0 20px;
  position: relative;
  z-index: 10;
}

.thumbnail-item {
  width: 160px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  transform-origin: center bottom;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.thumbnail-item img {
  width: 100%;
  height: 90px;
  object-fit: cover;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.thumbnail-item.active {
  transform: translateY(-10px) scale(1.2);
  box-shadow: 0 16px 24px rgba(0, 0, 0, 0.4);
  z-index: 2;
  border-color: #fff;
  border-width: 3px;
}

.thumbnail-item:not(.active) {
  filter: brightness(0.8);
  transform: scale(0.95);
  border-color: rgba(255, 255, 255, 0.6);
}

.thumbnail-item:hover:not(.active) {
  border-color: rgba(255, 255, 255, 0.9);
}

.thumbnail-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  font-size: 12px;
  color: #fff;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}
</style>