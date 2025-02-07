<template>
  <div class="search-result-container">
    <!-- 搜索结果分类导航 -->
    <div class="search-nav">
      <div class="nav-content">
        <div class="nav-items">
          <div v-for="(item, index) in navItems"
               :key="index"
               class="nav-item"
               :class="{ active: currentType === item.type }"
               @click="switchType(item.type)"
          >
            <span class="item-text">{{ item.name }}</span>
            <span class="item-count" v-if="item.count">({{ item.count }})</span>
          </div>
        </div>
        <div class="filter-options">
          <el-select v-model="sortBy" placeholder="排序方式" size="small">
            <el-option label="综合排序" value="default"/>
            <el-option label="最多播放" value="play"/>
            <el-option label="最新发布" value="pubdate"/>
            <el-option label="最多弹幕" value="danmaku"/>
          </el-select>
        </div>
      </div>
    </div>

    <!-- 搜索结果内容区（添加最小高度） -->
    <div class="search-content-wrapper">
      <div class="search-content">
        <!-- 添加空状态提示 -->
        <div v-if="!loading && searchResults.length === 0" class="empty-state">
          <svg class="empty-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path d="M855.6 427.2H168.5c-12.7 0-24.4 6.9-30.6 18L4.4 684.7C1.5 689.9 0 695.8 0 701.8v287.1c0 19.4 15.7 35.1 35.1 35.1h953.8c19.4 0 35.1-15.7 35.1-35.1V701.8c0-6-1.5-11.8-4.4-17.1L886 445.2c-6.2-11.1-17.9-18-30.4-18zM360 705.9c0 4.4-3.6 8-8 8h-80c-4.4 0-8-3.6-8-8v-80c0-4.4 3.6-8 8-8h80c4.4 0 8 3.6 8 8v80z" fill="#e6f7ff"/>
            <path d="M760 705.9c0 4.4-3.6 8-8 8h-80c-4.4 0-8-3.6-8-8v-80c0-4.4 3.6-8 8-8h80c4.4 0 8 3.6 8 8v80z" fill="#e6f7ff"/>
          </svg>
          <h3>暂无搜索结果</h3>
          <p>换个关键词试试吧~</p>
          <div class="suggestions">
            <span>建议您：</span>
            <ul>
              <li>检查是否有错别字</li>
              <li>简化搜索词</li>
              <li>尝试其他相关词</li>
            </ul>
          </div>
          <el-button type="primary" @click="router.push('/')" class="back-btn">
            返回首页
          </el-button>
        </div>

        <!-- 视频列表 -->
        <div v-else-if="currentType === 'video'" class="video-list">
          <div v-for="item in searchResults"
               :key="item.id"
               class="video-item"
               @click="router.push(`/video/${item.id}`)"
          >
            <div class="video-cover">
              <el-image
                  :src="item.cover || 'https://i0.hdslb.com/bfs/archive/default.jpg'"
                  fit="cover"
              >
                <template #placeholder>
                  <div class="image-placeholder">
                    <el-icon>
                      <Picture/>
                    </el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="video-info">
              <h3 class="video-title">{{ item.title }}</h3>
              <div class="video-meta">
                <div class="content-preview">{{ item.title }}</div>
              </div>
              <div class="uploader-info">
                <el-avatar
                    :size="24"
                    :src="item.userPic || 'https://i0.hdslb.com/bfs/face/default.jpg'"
                />
                <span class="uploader-name">{{ item.username || '用户未设置昵称' }}</span>
                <span class="upload-time">
                  <el-icon><Clock /></el-icon>
                  {{ formatDate(item.createTime) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 用户列表 -->
        <div v-else-if="currentType === 'user'" class="user-list">
          <div v-for="user in searchResults"
               :key="user.id"
               class="user-item"
          >
            <el-avatar :size="48" :src="user.avatar"/>
            <div class="user-info">
              <div class="user-name">{{ user.name }}</div>
              <div class="user-signature">{{ user.signature }}</div>
              <div class="user-stats">
                <span>粉丝: {{ formatCount(user.fans) }}</span>
                <span>视频: {{ user.videos }}</span>
              </div>
            </div>
            <el-button
                class="follow-btn"
                :type="user.isFollowed ? 'default' : 'primary'"
                size="small"
            >
              {{ user.isFollowed ? '已关注' : '关注' }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 分页器 -->
      <div v-if="searchResults.length > 0" class="pagination-wrapper">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            background
            layout="prev, pager, next"
            :pager-count="7"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {Picture, VideoPlay, ChatDotRound, Clock} from '@element-plus/icons-vue'
import {formatCount, formatDuration, formatDate} from '@/utils/format.js'
import {getSearchResult} from '@/api/Search'
import {ElMessage} from 'element-plus'
import {getSearchHistory, addSearchHistory} from '@/utils/searchHistory'

const route = useRoute()
const router = useRouter()

// 搜索历史
const searchHistory = ref([])

// 搜索导航项
const navItems = [
  {name: '视频', type: 'video', count: 0},
  {name: '用户', type: 'user', count: 0},
  {name: '番剧', type: 'anime', count: 0},
  {name: '直播', type: 'live', count: 0}
]

// 响应式数据
const currentType = ref('video')
const sortBy = ref('default')
const searchResults = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const loading = ref(false)

// 点击搜索历史
const handleHistoryClick = (keyword) => {
  addSearchHistory(keyword)
  router.push({
    path: '/search',
    query: { keyword }
  })
}

// 切换分类
const switchType = (type) => {
  currentType.value = type
  currentPage.value = 1
  fetchSearchResults()
}

// 获取搜索结果
const fetchSearchResults = async () => {
  if (!route.query.keyword) return

  loading.value = true
  try {
    const res = await getSearchResult({
      keyword: route.query.keyword,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    searchResults.value = res.data.items.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      cover: item.cover,
      userId: item.userId,
      nickname: item.nickname,
      userPic: item.userPic,
      username: item.username,
      introduction: item.introduction,
      videoUrl: item.videoUrl,
      createTime: item.createTime,
      updateTime: item.updateTime
    }))
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('获取搜索结果失败')
  } finally {
    loading.value = false
  }
}

// 监听路由参数变化
watch(() => route.query.keyword, (newKeyword) => {
  if (newKeyword) {
    currentPage.value = 1
    fetchSearchResults()
  }
})

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchSearchResults()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchSearchResults()
}

onMounted(() => {
  if (route.query.keyword) {
    fetchSearchResults()
  }
  // 获取搜索历史
  searchHistory.value = getSearchHistory()
})
</script>

<style lang="scss" scoped>
.search-result-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.search-nav {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .nav-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    height: 56px;
  }

  .nav-items {
    display: flex;
    gap: 32px;

    .nav-item {
      font-size: 16px;
      color: #18191c;
      cursor: pointer;
      padding: 6px 0;
      position: relative;

      &.active {
        color: #00aeec;
        font-weight: 500;

        &::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #00aeec;
        }
      }

      .item-count {
        font-size: 14px;
        color: #9499a0;
        margin-left: 4px;
      }
    }
  }
}

.search-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.search-content {
  flex: 1;
}

.video-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;

  .video-item {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      .video-title {
        color: #00aeec;
      }
    }

    .video-cover {
      position: relative;
      padding-top: 56.25%;

      .el-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      .video-duration {
        position: absolute;
        right: 8px;
        bottom: 8px;
        padding: 0 4px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        font-size: 12px;
        border-radius: 4px;
      }
    }

    .video-info {
      padding: 12px;

      .video-title {
        font-size: 14px;
        font-weight: 500;
        color: #18191c;
        margin-bottom: 8px;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .video-meta {
        margin-bottom: 8px;

        .content-preview {
          color: #61666d;
          font-size: 13px;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          line-height: 1.5;
        }
      }

      .uploader-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .uploader-name {
          font-size: 13px;
          color: #9499a0;
          margin-right: auto;
        }

        .upload-time {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #9499a0;
          font-size: 13px;

          .el-icon {
            font-size: 14px;
          }
        }
      }
    }
  }
}

.user-list {
  .user-item {
    display: flex;
    align-items: center;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    margin-bottom: 12px;

    .user-info {
      flex: 1;
      margin-left: 16px;

      .user-name {
        font-size: 16px;
        font-weight: 500;
        color: #18191c;
        margin-bottom: 4px;
      }

      .user-signature {
        font-size: 14px;
        color: #61666d;
        margin-bottom: 8px;
      }

      .user-stats {
        font-size: 13px;
        color: #9499a0;

        span {
          margin-right: 16px;
        }
      }
    }
  }
}

.pagination-wrapper {
  margin: 32px 0;
  display: flex;
  justify-content: center;

  :deep(.el-pagination) {
    .el-pagination__prev,
    .el-pagination__next {
      background-color: #fff;
      border: 1px solid #dcdfe6;
      padding: 0 4px;
      margin: 0 4px;
      min-width: 60px;
      height: 32px;
      line-height: 32px;
      border-radius: 4px;

      &:hover {
        color: #00aeec;
        border-color: #00aeec;
      }

      &.is-disabled {
        color: #c0c4cc;
        border-color: #dcdfe6;
        cursor: not-allowed;
      }
    }

    .el-pagination__prev {
      &::before {
        content: "上一页";
        font-size: 14px;
      }
    }

    .el-pagination__next {
      &::before {
        content: "下一页";
        font-size: 14px;
      }
    }

    .el-pager {
      li {
        min-width: 32px;
        height: 32px;
        line-height: 32px;
        border: 1px solid #dcdfe6;
        margin: 0 4px;
        border-radius: 4px;

        &:hover {
          color: #00aeec;
          border-color: #00aeec;
        }

        &.active {
          background-color: #00aeec;
          color: #fff;
          border-color: #00aeec;
        }

        &.is-active {
          background-color: #00aeec;
          color: #fff;
          border-color: #00aeec;
        }
      }
    }
  }
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
}

/* 添加空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: #fff;
  border-radius: 8px;
  margin: 20px 0;

  .empty-icon {
    width: 160px;
    height: 160px;
    color: #1890ff;
    margin-bottom: 24px;
  }

  h3 {
    font-size: 20px;
    color: #1f2937;
    margin-bottom: 8px;
    font-weight: 500;
  }

  p {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 24px;
  }

  .suggestions {
    text-align: left;
    margin-bottom: 32px;
    
    span {
      color: #4b5563;
      font-size: 14px;
      margin-bottom: 8px;
      display: block;
    }
    
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        color: #6b7280;
        font-size: 14px;
        margin-bottom: 8px;
        padding-left: 20px;
        position: relative;
        
        &::before {
          content: "•";
          position: absolute;
          left: 8px;
          color: #1890ff;
        }
      }
    }
  }

  .back-btn {
    padding: 10px 24px;
    font-size: 14px;
    background-color: #1890ff;
    border-color: #1890ff;
    
    &:hover {
      background-color: #40a9ff;
      border-color: #40a9ff;
    }
  }
}
</style>