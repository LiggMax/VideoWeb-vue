<template>
  <div class="danmaku-list-container">
    <div class="danmaku-header" @click="toggleExpand">
      <div class="header-left">
        <el-icon class="list-icon"><ChatDotRound /></el-icon>
        <span class="title">弹幕列表</span>
      </div>
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
              <span class="time">{{ formatTime(item.time || 0) }}</span>
              <span class="content" :style="{ color: isWhiteColor(item.color) ? '#18191c' : item.color }">
                {{ item.text }}
              </span>
            </div>
          </div>
        </template>
        <div v-else class="empty-state">
          <el-icon class="empty-icon"><ChatLineSquare /></el-icon>
          <span>暂无弹幕</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ArrowDown, ChatDotRound, ChatLineSquare } from '@element-plus/icons-vue'
import { getBarrageService } from '@/api/barrage'
import { ElMessage } from 'element-plus'

const props = defineProps({
  videoId: {
    type: [String, Number],
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
    if (res.code === 200) {
      danmakuList.value = res.data || []
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

// 判断是否为白色
const isWhiteColor = (color) => {
  if (!color) return false
  
  // 转换为小写以统一比较
  color = color.toLowerCase()
  
  // 检查各种白色的表示方式
  return color === '#fff' || 
         color === '#ffffff' || 
         color === 'rgb(255,255,255)' || 
         color === 'rgb(255, 255, 255)' || 
         color === 'white'
}

onMounted(() => {
  // 初始加载弹幕列表
  loadDanmakuList()
})

// 监听视频ID变化
watch(() => props.videoId, (newId) => {
  if (newId) {
    isDataLoaded.value = false
    danmakuList.value = []
    if (isExpanded.value) {
      loadDanmakuList()
    }
  }
})

// 添加数据加载状态监听
watch(() => danmakuList.value, (newList) => {
  console.log('弹幕列表数据:', newList)
}, { immediate: true })
</script>

<style lang="scss" scoped>
.danmaku-list-container {
  margin-top: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.danmaku-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid #f1f2f3;
  
  &:hover {
    background: #f5f7fa;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .list-icon {
      font-size: 18px;
      color: #00aeec;
    }
  }
  
  .title {
    font-size: 16px;
    font-weight: 500;
    color: #18191c;
  }
  
  .expand-icon {
    transition: transform 0.3s;
    color: #9499a0;
    
    &.is-expanded {
      transform: rotate(180deg);
    }
  }
}

.danmaku-content {
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
  background-color: #fbfbfb;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #e3e5e7;
    border-radius: 3px;
    
    &:hover {
      background-color: #c9ccd0;
    }
  }
}

.danmaku-items {
  min-height: 100px;
}

.danmaku-item {
  padding: 8px;
  background-color: #fff;
  margin-bottom: 1px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .danmaku-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .time {
      color: #9499a0;
      font-size: 13px;
      min-width: 45px;
    }
    
    .content {
      font-size: 14px;
      word-break: break-all;
      color: inherit;
      font-weight: 500;
      transition: all 0.2s;
      
      &:hover {
        opacity: 0.8;
      }
    }
  }
  
  &:hover {
    background-color: #f6f7f8;
  }
}

.danmaku-item:nth-child(even) {
  background-color: #fafafa;
  
  &:hover {
    background-color: #f6f7f8;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: #9499a0;
  background-color: #fff;
  
  .empty-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
  
  span {
    font-size: 14px;
  }
}
</style> 