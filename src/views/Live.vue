<template>
  <div class="developing-page">
    <div class="content">
      <div class="developing-icon">
        <svg class="building-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <path d="M880.64 358.4h-819.2v423.936c0 34.816 26.624 61.44 61.44 61.44h491.52c12.288 0 20.48 8.192 20.48 20.48s-8.192 20.48-20.48 20.48h-491.52c-57.344 0-102.4-45.056-102.4-102.4v-552.96c0-57.344 45.056-102.4 102.4-102.4h696.32c57.344 0 102.4 45.056 102.4 102.4v176.128c0 12.288-8.192 20.48-20.48 20.48s-20.48-8.192-20.48-20.48v-47.104z m0-40.96v-88.064c0-34.816-26.624-61.44-61.44-61.44h-696.32c-34.816 0-61.44 26.624-61.44 61.44v88.064h819.2z m-204.8-51.2c-12.288 0-20.48-8.192-20.48-20.48s8.192-20.48 20.48-20.48 20.48 8.192 20.48 20.48-8.192 20.48-20.48 20.48z m61.44 0c-12.288 0-20.48-8.192-20.48-20.48s8.192-20.48 20.48-20.48 20.48 8.192 20.48 20.48-8.192 20.48-20.48 20.48z m61.44 0c-12.288 0-20.48-8.192-20.48-20.48s8.192-20.48 20.48-20.48 20.48 8.192 20.48 20.48-8.192 20.48-20.48 20.48z m-448.512 241.664c6.144-10.24 18.432-12.288 28.672-8.192 10.24 6.144 12.288 18.432 8.192 28.672l-102.4 178.176c-6.144 10.24-18.432 12.288-28.672 8.192s-12.288-18.432-8.192-28.672l102.4-178.176z m-126.976 6.144l-55.296 90.112 55.296 94.208c6.144 10.24 2.048 22.528-8.192 28.672-10.24 6.144-22.528 2.048-28.672-8.192l-67.584-114.688 67.584-110.592c6.144-10.24 18.432-12.288 28.672-6.144 10.24 4.096 12.288 16.384 8.192 26.624z m188.416 184.32l55.296-94.208-55.296-90.112c-6.144-10.24-2.048-22.528 6.144-28.672 10.24-6.144 22.528-2.048 28.672 6.144l67.584 110.592-67.584 114.688c-6.144 10.24-18.432 12.288-28.672 8.192-8.192-4.096-10.24-18.432-6.144-26.624z m577.536-122.88l4.096 10.24-40.96 51.2c-8.192 10.24-8.192 26.624 0 36.864l38.912 47.104-4.096 10.24c-8.192 26.624-22.528 51.2-38.912 71.68l-8.192 10.24-61.44-10.24c-12.288-2.048-26.624 6.144-30.72 18.432l-20.48 61.44-10.24 2.048c-32.768 8.192-69.632 8.192-102.4 0l-12.288-2.048-20.48-61.44c-4.096-12.288-18.432-20.48-30.72-18.432l-63.488 10.24-8.192-8.192c-8.192-10.24-16.384-20.48-22.528-32.768-8.192-12.288-14.336-26.624-18.432-40.96l-4.096-10.24 40.96-49.152c8.192-10.24 8.192-26.624 0-36.864l-40.96-49.152 4.096-10.24c10.24-26.624 22.528-51.2 40.96-73.728l8.192-8.192 61.44 10.24c12.288 2.048 26.624-6.144 30.72-18.432l22.528-61.44 10.24-2.048c32.768-6.144 67.584-6.144 100.352 0l12.288 2.048 20.48 59.392c4.096 12.288 18.432 20.48 30.72 20.48l63.488-8.192 8.192 8.192c8.192 10.24 16.384 20.48 22.528 32.768 8.192 12.288 14.336 24.576 18.432 38.912z" fill="currentColor"/>
        </svg>
        <div class="circle-ripple"></div>
      </div>
      <h2>功能开发中</h2>
      <div class="progress-bar">
        <div class="progress-inner"></div>
      </div>
      <p class="description">
        <span class="highlight">直播功能</span>正在紧锣密鼓地开发中
        <br>敬请期待精彩内容...
      </p>
      <div class="features">
        <div class="feature-item">
          <el-icon><VideoCamera /></el-icon>
          <span>高清直播</span>
        </div>
        <div class="feature-item">
          <el-icon><ChatDotRound /></el-icon>
          <span>实时互动</span>
        </div>
        <div class="feature-item">
          <el-icon><Present /></el-icon>
          <span>礼物系统</span>
        </div>
      </div>
      <el-button type="primary" @click="handleBack" class="back-btn">
        <el-icon><Back /></el-icon>
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { VideoCamera, ChatDotRound, Present, Back } from '@element-plus/icons-vue'

// 获取路由实例
const router = useRouter()

// 返回首页方法
const handleBack = () => {
  router.push('/')
}
</script>

<style scoped>
.developing-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  overflow: hidden;
}

.content {
  text-align: center;
  width: 100%;
  max-width: 800px;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.developing-icon {
  margin-bottom: 0;
}

.building-icon {
  width: 160px;
  height: 160px;
  color: #1890ff;
}

h2 {
  font-size: 24px;
  color: #1f2937;
  margin: 0;
  font-weight: 600;
}

.progress-bar {
  width: 200px;
  height: 3px;
  background: #e6f7ff;
  border-radius: 1.5px;
  margin: 0 auto;
  overflow: hidden;
}

.progress-inner {
  width: 30%;
  height: 100%;
  background: #1890ff;
  border-radius: 1.5px;
  animation: progress 2s ease-in-out infinite;
}

.description {
  font-size: 16px;
  color: #4b5563;
  margin: 0;
  line-height: 1.8;
}

.highlight {
  color: #1890ff;
  font-weight: 500;
}

.features {
  width: 100%;
  max-width: 600px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin: 10px 0;
  padding: 0 20px;
}

.feature-item {
  .el-icon {
    font-size: 24px;
    padding: 12px;
    color: #1890ff;
    background: #e6f7ff;
    margin-bottom: 8px;
    border-radius: 8px;
    transition: all 0.3s ease;
  }
  
  span {
    font-size: 14px;
    color: #4b5563;
  }

  &:hover .el-icon {
    background: #bae7ff;
    transform: translateY(-2px);
  }
}

.back-btn {
  padding: 12px 36px;
  font-size: 16px;
  background-color: #1890ff;
  border-color: #1890ff;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  
  .el-icon {
    font-size: 16px;
  }
  
  &:hover {
    background-color: #40a9ff;
    border-color: #40a9ff;
  }
}

@keyframes progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .content {
    padding: 0 24px;
    gap: 16px;
  }

  .building-icon {
    width: 120px;
    height: 120px;
  }

  .features {
    gap: 20px;
    padding: 0;
    margin: 10px 0;
  }

  .feature-item {
    .el-icon {
      font-size: 20px;
      padding: 10px;
    }
    
    span {
      font-size: 12px;
    }
  }
}

/* 小屏幕适配 */
@media screen and (max-width: 480px) {
  .content {
    padding: 0 20px;
  }

  .features {
    gap: 16px;
  }

  h2 {
    font-size: 20px;
  }

  .description {
    font-size: 13px;
  }
}

/* 超窄屏幕适配 */
@media screen and (max-width: 360px) {
  .features {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .feature-item {
    .el-icon {
      font-size: 18px;
      padding: 8px;
    }
    
    span {
      font-size: 11px;
    }
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .developing-page {
    background: #141414;
  }

  h2 {
    color: #e6f7ff;
  }

  .description {
    color: #bfbfbf;
  }

  .feature-item {
    span {
      color: #bfbfbf;
    }
    
    .el-icon {
      background: #111827;
      color: #40a9ff;
    }

    &:hover .el-icon {
      background: #1f2937;
    }
  }

  .progress-bar {
    background: #111827;
  }

  .building-icon {
    color: #40a9ff;
  }

  .highlight {
    color: #40a9ff;
  }
}
</style> 