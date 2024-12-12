<template>
  <div class="search-container">
    <el-input
      v-model="searchQuery"
      placeholder="搜索视频、番剧、用户"
      class="search-input"
    >
      <template #suffix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const searchQuery = ref('')
</script>

<style scoped>
.search-container {
  width: 100%;
  padding: 0 20px;
}

.search-input {
  width: 100%;
}
</style> 