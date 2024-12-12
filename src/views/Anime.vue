<template>
  <div class="anime">
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
</style> 