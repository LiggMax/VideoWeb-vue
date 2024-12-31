<template>
  <div class="search-container">
    <div class="search-wrapper">
      <el-input
        v-model="inputValue"
        placeholder="输入关键词搜索"
        class="search-input"
        :class="{ 'is-focused': isFocused, 'is-mobile': isMobile }"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keyup.enter="handleSearch"
        @input="handleInput"
        ref="inputRef"
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
      <el-button v-if="!isMobile" class="search-btn" type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
      </el-button>
    </div>
   
    <!-- 搜索建议下拉面板 -->
    <div class="search-dropdown" v-show="isFocused">
      <div class="search-header" v-if="!inputValue && searchHistory.length">
        <span>搜索历史</span>
        <span class="clear-btn" @click="clearHistory">清空</span>
      </div>
      <div class="search-list" v-if="!inputValue && searchHistory.length">
        <div class="history-tags">
          <div v-for="(item, index) in displayHistory" 
                :key="index" 
                class="history-tag"
                @click="selectHistory(item)"
          >
            <el-icon><Clock /></el-icon>
            <span>{{ item }}</span>
          </div>
        </div>
      </div>

      <!-- 搜索建议列表 -->
      <div class="search-list" v-else-if="inputValue && filteredHistory.length">
        <div class="suggestion-list">
          <div v-for="(item, index) in filteredHistory" 
                :key="index" 
                class="history-item"
                @click="selectHistory(item)"
          >
            <el-icon><Search /></el-icon>
            <span v-html="highlightKeyword(item)"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Search, Close, Delete, Clock } from '@element-plus/icons-vue'
import { getSearchHistory, addSearchHistory, clearSearchHistory } from '@/utils/searchHistory'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  isMobile: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const inputValue = ref(props.modelValue)
const isFocused = ref(false)
const searchHistory = ref([])

// 显示的历史记录数量
const displayCount = ref(5)

// 计算显示的历史记录
const displayHistory = computed(() => {
  return searchHistory.value.slice(0, displayCount.value)
})

watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal
})

watch(inputValue, (newVal) => {
  emit('update:modelValue', newVal)
})

const selectHistory = (item) => {
  inputValue.value = item
  isFocused.value = false
  addSearchHistory(item)
  searchHistory.value = getSearchHistory()
  // 跳转到搜索结果页面
  router.push({
    path: '/search',
    query: { keyword: item }
  })
  emit('search')
}

const clearHistory = () => {
  clearSearchHistory()
  searchHistory.value = []
}

// 点击外部关闭下拉面板
const handleClickOutside = (e) => {
  const container = document.querySelector('.search-container')
  if (container && !container.contains(e.target)) {
    isFocused.value = false
  }
}

const handleSearch = () => {
  if (!inputValue.value.trim()) return
  const keyword = inputValue.value.trim()
  addSearchHistory(keyword)
  searchHistory.value = getSearchHistory()
  isFocused.value = false
  // 跳转到搜索结果页面
  router.push({
    path: '/search',
    query: { keyword }
  })
}

// 过滤搜索历史
const filteredHistory = computed(() => {
  if (!inputValue.value) return []
  const keyword = inputValue.value.toLowerCase()
  return searchHistory.value.filter(item => 
    item.toLowerCase().includes(keyword)
  )
})

// 高亮关键词
const highlightKeyword = (text) => {
  if (!inputValue.value) return text
  const keyword = inputValue.value
  const regex = new RegExp(keyword, 'gi')
  return text.replace(regex, match => `<span class="highlight">${match}</span>`)
}

// 输入处理
const handleInput = () => {
  if (!isFocused.value) {
    isFocused.value = true
  }
}

const inputRef = ref(null)

// 提供聚焦方法给父组件
const focus = () => {
  inputRef.value?.focus()
}

defineExpose({
  focus
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  searchHistory.value = getSearchHistory()
  // 如果当前在搜索页面，设置搜索框的值
  if (route.path === '/search' && route.query.keyword) {
    inputValue.value = route.query.keyword
  }
})

// 监听路由变化
watch(() => route.query.keyword, (newKeyword) => {
  if (route.path === '/search' && newKeyword) {
    inputValue.value = newKeyword
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.search-container {
  position: relative;
  width: 100%;
}

.search-wrapper {
  display: flex;
  align-items: stretch;
  width: 100%;
}

.search-input {
  width: 100%;
  flex: 1;
  transition: all 0.3s;
  
  :deep(.el-input__wrapper) {
    background-color: #f1f2f3;
    border-radius: 8px 0 0 8px;
    padding: 0 12px;
    box-shadow: none !important;
    transition: all 0.3s;
    height: 34px;
    border-right: none;
    
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
  
  &:hover {
    background-color: #fc8bab;
    border-color: #fc8bab;
  }
  
  .el-icon {
    font-size: 16px;
  }
}

/* 当搜索框获得焦点时，保持按钮的边框颜色 */
.search-input.is-focused + .search-btn {
  border-color: var(--el-input-focus-border-color, #409eff);
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
  z-index: 1000;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f2f3;
  
  span {
    font-size: 12px;
    color: #9499a0;
  }
  
  .clear-btn {
    cursor: pointer;
    
    &:hover {
      color: #00aeec;
    }
  }
}

.search-list {
  padding: 8px 16px;

  .history-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .history-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: #f6f7f8;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s;
      border: 1px solid #e3e5e7;
      
      .el-icon {
        font-size: 14px;
        color: #9499a0;
      }
      
      span {
        font-size: 13px;
        color: #18191c;
      }
      
      &:hover {
        background-color: #f1f2f3;
        border-color: #00aeec;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        
        span {
          color: #00aeec;
        }
        
        .el-icon {
          color: #00aeec;
        }
      }
    }
  }

  .suggestion-list {
    .history-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: pointer;
      
      .el-icon {
        font-size: 14px;
        color: #9499a0;
      }
      
      span {
        font-size: 14px;
        color: #18191c;
      }
      
      &:hover {
        background-color: #f1f2f3;
        
        span {
          color: #00aeec;
        }
        
        .el-icon {
          color: #00aeec;
        }
      }
    }
  }
}

/* 移动端样式 */
.search-input.is-mobile :deep(.el-input__inner) {
  height: 40px;
  font-size: 14px;
  border-radius: 20px;
  padding-left: 16px;
  background: #f6f7f8;
}

.search-input.is-mobile :deep(.el-input__prefix) {
  left: 12px;
}

.search-input.is-mobile :deep(.el-input__suffix) {
  right: 12px;
}

@media screen and (max-width: 768px) {
  .search-dropdown {
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    max-height: calc(100vh - 56px);
    overflow-y: auto;
    border-radius: 0;
    box-shadow: none;
    border-top: 1px solid #f1f2f3;
  }
}
</style>