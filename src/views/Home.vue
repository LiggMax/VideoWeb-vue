<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="18">
        <div class="content-section">
          <el-carousel height="300px">
            <el-carousel-item v-for="item in 4" :key="item">
              <div class="carousel-content">推荐内容 {{ item }}</div>
            </el-carousel-item>
          </el-carousel>
          
          <div class="video-grid">
            <el-card v-for="n in 8" :key="n" class="video-card">
              <div class="video-thumbnail"></div>
              <div class="video-title">示例视频标题 {{ n }}</div>
              <div class="video-info">
                <span>UP主: 用户{{ n }}</span>
                <span>播放: 1.2万</span>
              </div>
            </el-card>
          </div>
        </div>
      </el-col>
      
      <el-col :span="6">
        <div class="sidebar">
          <el-card class="rank-card">
            <template #header>
              <div class="rank-header">排行榜</div>
            </template>
            <div v-for="n in 10" :key="n" class="rank-item">
              <span class="rank-num">{{ n }}</span>
              <span class="rank-title">热门视频 {{ n }}</span>
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
</style> 