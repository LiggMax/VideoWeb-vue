<template>
  <div class="user-center">
    <!-- 顶部背景和用户信息 -->
    <div class="user-header">
      <div class="header-bg">
        <div class="bg-overlay"></div>
      </div>
      <div class="user-info-card">
        <div class="user-basic">
          <div class="avatar-wrap">
            <el-avatar :size="120" :src="userInfo.userPic || defaultAvatar" />
            <div class="level-tag">LV6</div>
          </div>
          <div class="user-detail">
            <div class="name-row">
              <h1 class="username">{{ userInfo.nickname || userInfo.username }}</h1>
              <el-button size="small" class="edit-btn">
                <el-icon><Edit /></el-icon>
                编辑资料
              </el-button>
            </div>
            <div class="user-id">UID: {{ userInfo.id || '123456789' }}</div>
            <div class="user-intro">这个人很懒，什么都没有写</div>
          </div>
        </div>
        <div class="user-stats">
          <div class="stat-group">
            <div class="stat-item">
              <div class="num">301</div>
              <div class="label">关注</div>
            </div>
            <div class="stat-item">
              <div class="num">4</div>
              <div class="label">粉丝</div>
            </div>
            <div class="stat-item">
              <div class="num">1</div>
              <div class="label">获赞</div>
            </div>
            <div class="stat-item">
              <div class="num">0</div>
              <div class="label">播放量</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrap">
      <div class="content-main">
        <!-- 左侧导航 -->
        <div class="side-nav">
          <div class="nav-item" 
               v-for="item in navItems" 
               :key="item.name"
               :class="{ active: currentNav === item.name }"
               @click="currentNav = item.name">
            <el-icon>
              <component :is="item.icon"></component>
            </el-icon>
            {{ item.label }}
            <span class="count" v-if="item.count">({{ item.count }})</span>
          </div>
        </div>

        <!-- 右侧内容 -->
        <div class="main-content">
          <div class="empty-state" v-if="!hasContent">
            <el-empty :description="getEmptyText">
              <template #image>
                <img src="@/assets/empty-state.png" class="empty-img">
              </template>
              <template #description>
                <p class="empty-text">{{ getEmptyText }}</p>
              </template>
              <el-button type="primary" @click="goToUpload" v-if="currentNav === 'videos'">
                <el-icon><VideoCamera /></el-icon>
                立即投稿
              </el-button>
            </el-empty>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  VideoCamera, 
  Collection, 
  Star, 
  Edit,
  Document,
  ChatDotRound
} from '@element-plus/icons-vue'
import useUserInfoStore from '@/stores/userInfo'

const router = useRouter()
const userInfoStore = useUserInfoStore()
const currentNav = ref('videos')
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const userInfo = computed(() => userInfoStore.info)
const hasContent = ref(false)

const navItems = [
  { name: 'videos', label: '视频', icon: 'VideoCamera', count: 0 },
  { name: 'favorites', label: '收藏', icon: 'Collection', count: 0 },
  { name: 'likes', label: '点赞', icon: 'Star', count: 0 },
  { name: 'articles', label: '专栏', icon: 'Document', count: 0 },
  { name: 'comments', label: '评论', icon: 'ChatDotRound', count: 0 }
]

const getEmptyText = computed(() => {
  const texts = {
    videos: '还没有发布过视频哦',
    favorites: '还没有收藏任何内容',
    likes: '还没有点赞过内容',
    articles: '还没有发布过专栏文章',
    comments: '还没有发表过评论'
  }
  return texts[currentNav.value]
})

const goToUpload = () => {
  router.push('/upload')
}
</script>

<style scoped>
.user-center {
  min-height: 100vh;
  background-color: #f1f2f3;
}

.user-header {
  position: relative;
  height: 240px;
  color: #18191c;
  margin-bottom: 20px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(to bottom, #f6f7f8, #fff);
}

.user-info-card {
  position: relative;
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.user-basic {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  margin-bottom: 0;
  position: relative;
  z-index: 2;
  padding-top: 20px;
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
  margin-bottom: 0;
}

.avatar-wrap :deep(.el-avatar) {
  border: 4px solid #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.level-tag {
  position: absolute;
  bottom: -6px;
  right: -6px;
  background: #ff6699;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-detail {
  flex: 1;
  min-width: 0;
  color: #18191c;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.username {
  font-size: 26px;
  font-weight: bold;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  color: #18191c;
}

.edit-btn {
  padding: 8px 16px;
  border-radius: 4px;
  background: #f4f5f7;
  border: 1px solid #e3e5e7;
  color: #61666d;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: #e3e5e7;
}

.user-id {
  font-size: 14px;
  color: #61666d;
  margin-bottom: 8px;
}

.user-intro {
  font-size: 14px;
  color: #61666d;
  max-width: 600px;
  line-height: 1.5;
}

.user-stats {
  border-top: 1px solid #e3e5e7;
  padding-top: 16px;
  position: relative;
  z-index: 2;
  margin-top: 20px;
}

.stat-group {
  display: flex;
  gap: 60px;
  justify-content: flex-start;
  padding-bottom: 16px;
}

.stat-item {
  text-align: center;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-item .num {
  font-size: 22px;
  font-weight: bold;
  color: #18191c;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-item .label {
  font-size: 13px;
  color: #61666d;
  line-height: 1;
}

.content-area {
  background-color: #fff;
  border-radius: 8px;
  margin: 0 auto;
  max-width: 1100px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.nav-tabs {
  background: #fff;
  border-radius: 4px;
  margin-bottom: 20px;
}

.nav-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  border-bottom: 1px solid #e3e5e7;
}

.nav-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #e3e5e7;
}

.nav-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 24px;
  height: 46px;
  line-height: 46px;
  color: #61666d;
}

.nav-tabs :deep(.el-tabs__item.is-active) {
  color: #18191c;
  font-weight: bold;
}

.nav-tabs :deep(.el-tabs__active-bar) {
  background-color: #18191c;
}

.content-wrap {
  background: #fff;
  min-height: calc(100vh - 364px);
}

.content-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  gap: 24px;
}

.side-nav {
  width: 200px;
  flex-shrink: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-item:hover {
  background: #f6f7f8;
  color: #fb7299;
}

.nav-item.active {
  background: #fff1f5;
  color: #fb7299;
  font-weight: 500;
}

.count {
  font-size: 12px;
  color: #999;
  margin-left: 4px;
}

.main-content {
  flex: 1;
  min-height: 400px;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

.empty-img {
  width: 200px;
  margin-bottom: 20px;
}

.empty-text {
  color: #666;
  font-size: 14px;
  margin: 16px 0;
}

:deep(.el-button--primary) {
  background: #fb7299;
  border-color: #fb7299;
}

:deep(.el-button--primary:hover) {
  background: #fc8bab;
  border-color: #fc8bab;
}
</style> 