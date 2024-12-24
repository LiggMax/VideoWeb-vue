<template>
  <div class="search-container">
    <div class="search-wrapper">
      <el-input
        v-model="inputValue"
        placeholder="输入关键词搜索"
        class="search-input"
        :class="{ 'is-focused': isFocused }"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon class="search-icon"><Search /></el-icon>
        </template>
        <template #suffix>
          <div class="search-suffix" v-if="inputValue">
            <el-icon class="clear-icon" @click="inputValue = ''"><Close /></el-icon>
          </div>
        </template>
      </el-input>
      <el-button class="search-btn" type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
      </el-button>
    </div>
   
    <!-- 搜索建议下拉面板 -->
    <div class="search-dropdown" v-show="isFocused">
      <div class="search-history" v-if="!inputValue">
        <div class="history-header">
          <span>搜索历史</span>
          <el-icon class="clear-history" @click="clearHistory"><Delete /></el-icon>
        </div>
        <div class="history-list">
          <div v-for="(item, index) in searchHistory" 
               :key="index" 
               class="history-item"
               @click="selectHistory(item)"
          >
            <el-icon><Clock /></el-icon>
            <span>{{ item }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Search, Close, Delete, Clock } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const inputValue = ref(props.modelValue)
const isFocused = ref(false)
const searchHistory = ref([
  'Vue.js教程',
  'Spring Boot实战',
  '前端开发',
  'Java编程'
])

watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal
})

watch(inputValue, (newVal) => {
  emit('update:modelValue', newVal)
})

const selectHistory = (item) => {
  inputValue.value = item
}

const clearHistory = () => {
  searchHistory.value = []
}

// 点击外部关闭下拉面板
const handleClickOutside = (e) => {
  const container = document.querySelector('.search-container')
  if (container && !container.contains(e.target)) {
    isFocused.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleSearch = () => {
  if (!inputValue.value.trim()) return
  emit('search')
}
</script>

<style lang="scss" scoped>
.search-container {
  position: relative;
  width: 100%;
}

.search-wrapper {
  display: flex;
  position: relative;
}

.search-input {
  flex: 1;
  transition: all 0.3s;
  
  :deep(.el-input__wrapper) {
    background-color: #f1f2f3;
    border-radius: 8px 0 0 8px;
    padding: 0 12px;
    box-shadow: none !important;
    transition: all 0.3s;
    height: 34px;
    
    &:hover {
      background-color: #fff;
      box-shadow: 0 0 0 1px #e3e5e7 !important;
    }
  }
  
  &.is-focused :deep(.el-input__wrapper) {
    background-color: #fff;
    box-shadow: 0 0 0 1px #c9ccd0 !important;
  }
  
  :deep(.el-input__inner) {
    font-size: 14px;
    height: 100%;
    
    &::placeholder {
      color: #9499a0;
    }
  }
}

.search-icon {
  font-size: 16px;
  color: #9499a0;
  margin-right: 4px;
}

.clear-icon {
  font-size: 16px;
  color: #9499a0;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  margin-left: 4px;
  
  &:hover {
    background-color: #f1f2f3;
    color: #6d757a;
  }
}

.search-btn {
  height: 34px;
  width: 48px;
  padding: 0;
  border-radius: 0 8px 8px 0;
  background-color: #fb7299;
  border-color: #fb7299;
  position: relative;
  left: -1px;
  
  &:hover {
    background-color: #fc8bab;
    border-color: #fc8bab;
    z-index: 1;
  }
  
  .el-icon {
    font-size: 16px;
  }
}

/* 搜索下拉面板 */
.search-dropdown {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 12px 0;
  z-index: 1000;
}

.search-history {
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px 8px;
    color: #9499a0;
    font-size: 12px;
    border-bottom: 1px solid #f1f2f3;
    
    .clear-history {
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      
      &:hover {
        background-color: #f1f2f3;
        color: #6d757a;
      }
    }
  }
  
  .history-list {
    padding: 4px 0;
  }
  
  .history-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    cursor: pointer;
    color: #18191c;
    font-size: 14px;
    
    .el-icon {
      font-size: 16px;
      color: #9499a0;
    }
    
    &:hover {
      background-color: #f1f2f3;
    }
  }
}
</style> 