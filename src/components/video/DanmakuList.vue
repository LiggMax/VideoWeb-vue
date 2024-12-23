<template>
  <div class="danmaku-list-container">
    <div class="danmaku-header" @click="toggleExpand">
      <span class="title">弹幕列表</span>
      <el-icon class="expand-icon" :class="{ 'is-expanded': isExpanded }">
        <ArrowDown />
      </el-icon>
    </div>
    
    <div class="danmaku-content" v-show="isExpanded">
      <div class="danmaku-items" v-loading="loading">
        <template v-if="danmakuList.length">
          <div v-for="item in danmakuList" 
               :key="item.id" 
               class="danmaku-item"
          >
            <div class="danmaku-info">
              <span class="time">{{ formatTime(item.timePoint) }}</span>
              <span class="content" :style="{ color: item.color }">
                {{ item.content }}
              </span>
            </div>
          </div>
        </template>
        <el-empty v-else description="暂无弹幕" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { getBarrageService } from '@/api/barrage'
import { ElMessage } from 'element-plus'

const props = defineProps({
  videoId: {
    type: String,
    required: true
  }
})

const isExpanded = ref(false)
const loading = ref(false)
const danmakuList = ref([])
const isDataLoaded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value && !isDataLoaded.value) {
    loadDanmakuList()
  }
}

const loadDanmakuList = async () => {
  loading.value = true
  try {
    const res = await getBarrageService(props.videoId)
    if (res.code === 0) {
      danmakuList.value = res.data.map(item => ({
        ...item,
        timePoint: item.timePoint || 0
      }))
      isDataLoaded.value = true
    }
  } catch (error) {
    console.error('获取弹幕列表失败:', error)
    ElMessage.error('获取弹幕列表失败')
  } finally {
    loading.value = false
  }
}

const formatTime = (seconds) => {
  const time = Number(seconds) || 0
  const minutes = Math.floor(time / 60)
  const remainingSeconds = Math.floor(time % 60)
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

onMounted(() => {
  // loadDanmakuList()
})
</script>

<style lang="scss" scoped>
.danmaku-list-container {
  margin-top: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.danmaku-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  
  &:hover {
    background: #f5f5f5;
  }
  
  .title {
    font-size: 16px;
    font-weight: 500;
    color: #000;
  }
  
  .expand-icon {
    transition: transform 0.3s;
    color: #000;
    
    &.is-expanded {
      transform: rotate(180deg);
    }
  }
}

.danmaku-content {
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.danmaku-items {
  min-height: 100px;
}

.danmaku-item {
  padding: 8px;
  border-bottom: 1px solid #6b6b6b;
  
  &:last-child {
    border-bottom: none;
  }
  
  .danmaku-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .time {
      color: #020000;
      font-size: 13px;
      min-width: 45px;
    }
    
    .content {
      font-size: 14px;
      word-break: break-all;
      color: #000 !important;
      font-weight: 500;
    }
  }
}
</style> 