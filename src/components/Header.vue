<template>
  <div class="header" :class="{ 'header-scrolled': isScrolled }">
    <div class="header-content">
      <!-- 左侧Logo和导航 -->
      <div class="left-section">
        <div class="logo">
          <div class="tv-icon">
            <el-icon><Monitor /></el-icon>
          </div>
          <span class="logo-text">哔哩哔哩</span>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-item" active-class="active">首页</router-link>
          <router-link to="/anime" class="nav-item" active-class="active">番剧</router-link>
          <router-link to="/live" class="nav-item" active-class="active">直播</router-link>
        </div>
      </div>

      <!-- 中间搜索框 -->
      <div class="center-search">
        <SearchBar />
      </div>

      <!-- 右侧用户区域 -->
      <div class="right-section">
        <div class="user-actions">
          <el-button class="upload-btn" type="primary" plain>
            <el-icon><VideoCamera /></el-icon>投稿
          </el-button>
        </div>
        <div class="user-info">
          <div class="user-avatar" @click="showLoginDialog">
            <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
          </div>
          <div class="user-icons">
            <el-badge :value="3" class="message-badge">
              <el-icon><Message /></el-icon>
            </el-badge>
            <el-icon><Star /></el-icon>
            <el-icon><Collection /></el-icon>
            <el-icon><Clock /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 添加登录对话框组件 -->
  <LoginDialog :visible="loginDialogVisible" @update:visible="loginDialogVisible = $event" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SearchBar from '@/components/SearchBar.vue'
import LoginDialog from '@/components/LoginDialog.vue'
import { 
  VideoCamera, 
  Message, 
  Star, 
  Collection, 
  Clock,
  Monitor
} from '@element-plus/icons-vue'

const activeIndex = ref('/')
const isScrolled = ref(false)

// 登录对话框显示状态
const loginDialogVisible = ref(false)

// 监听滚动事件
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 显示登录对话框
const showLoginDialog = () => {
  loginDialogVisible.value = true
  console.log('显示登录弹窗', loginDialogVisible.value)
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
}

.header-scrolled {
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  gap: 20px;
}

.left-section {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 20px;
  cursor: pointer;
}

.tv-icon {
  background-color: #fb7299;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tv-icon .el-icon {
  font-size: 20px;
  color: white;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #18191c;
  font-family: "Microsoft YaHei", sans-serif;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

.logo:hover .tv-icon {
  background-color: #fc8bab;
  transition: background-color 0.3s ease;
}

.logo:hover .logo-text {
  color: #fb7299;
  transition: color 0.3s ease;
}

.nav-links {
  display: flex;
  align-items: center;
  margin-left: 20px;
  gap: 30px;
}

.nav-item {
  font-size: 14px;
  color: #18191c;
  text-decoration: none;
  font-weight: 500;
  height: 64px;
  line-height: 64px;
  padding: 0 12px;
  position: relative;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: #fb7299;
}

.nav-item.active {
  color: #fb7299;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #fb7299;
}

.center-search {
  flex: 0 1 500px;
  min-width: 300px;
  margin: 0;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
}

.user-actions {
  display: flex;
  gap: 12px;
}

.user-actions :deep(.el-button) {
  backdrop-filter: blur(4px);
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-icons {
  display: flex;
  gap: 16px;
  font-size: 20px;
  color: #666;
}

.user-icons .el-icon {
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-icons .el-icon:hover {
  color: #00aeec;
}

.message-badge :deep(.el-badge__content) {
  background-color: #fb7299;
}

.user-avatar {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.1);
}

:deep(.el-menu--horizontal > .el-menu-item.is-active) {
  border-bottom: 2px solid #fb7299;
  color: #fb7299;
  font-weight: bold;
}

:deep(.el-button--primary) {
  background-color: #fb7299;
  border-color: #fb7299;
}

:deep(.el-button--primary:hover) {
  background-color: #fc8bab;
  border-color: #fc8bab;
}

:deep(.el-button--primary.is-plain) {
  color: #fb7299;
  background: #fff;
  border-color: #fb7299;
}

:deep(.el-button--primary.is-plain:hover) {
  background: #fb7299;
  border-color: #fb7299;
  color: #fff;
}
</style> 