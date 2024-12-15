<template>
  <div class="video-player">
    <div class="video-title" v-show="showTitle">
      {{ title }}
    </div>
    
    <!-- 播放器主体 -->
    <video
      ref="videoRef"
      class="video-element"
      :src="videoUrl"
      :poster="poster"
      @play="handlePlay"
      @pause="handlePause"
      @ended="handleEnded"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @volumechange="handleVolumeChange"
      @mouseover="showTitle = true"
      @mouseleave="showTitle = false"
    >
      您的浏览器不支持 HTML5 视频播放
    </video>

    <!-- 在自定义控制栏之前添加 -->
    <div class="float-play-btn" 
      v-show="!isPlaying && !isEnded" 
      @click="togglePlay"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        height="60" 
        width="60" 
        viewBox="0 0 24 24"
      >
        <path 
          d="M20 2H4C1.8 2 0 3.8 0 6v12c0 2.2 1.8 4 4 4h16c2.2 0 4-1.8 4-4V6c0-2.2-1.8-4-4-4zm-4.4 10.8L10.5 16c-.6.5-1.5 0-1.5-.8V8.8c0-.8.9-1.3 1.5-.8l5.1 3.2c.7.3.7 1.3 0 1.6z"
          fill="currentColor"
        />
      </svg>
    </div>

    <!-- 自定义控制栏 -->
    <div class="custom-controls" v-show="!isEnded">
      <!-- 进度条 -->
      <div class="progress-bar" 
        ref="progressRef"
        @click="handleProgressClick"
        @mousedown="startDragging"
        @mousemove="isDragging ? handleDragging : handleProgressHover"
        @mouseleave="hideTimeTooltip"
      >
        <div class="progress-loaded" :style="{ width: loadedProgress + '%' }"></div>
        <div class="progress-current" :style="{ width: currentProgress + '%' }">
          <div class="progress-handle" :class="{ 'is-dragging': isDragging }"></div>
        </div>
        <div class="time-tooltip" :style="{ left: tooltipPosition + 'px' }" v-show="showTooltip">
          {{ tooltipTime }}
        </div>
      </div>

      <!-- 控制按钮区 -->
      <div class="controls-bar">
        <div class="left-controls">
          <!-- 播放/暂停按钮 -->
          <el-tooltip
            :content="isPlaying ? '暂停' : '播放'"
            placement="top"
            effect="dark"
          >
            <button class="control-btn play-btn" @click="togglePlay">
              <svg 
                class="play-icon" 
                viewBox="0 0 22 22" 
                xmlns="http://www.w3.org/2000/svg"
                width="40" 
                height="40"
              >
                <path 
                  v-if="isPlaying"
                  d="M7 3a2 2 0 0 0-2 2v12a2 2 0 1 0 4 0V5a2 2 0 0 0-2-2zm8 0a2 2 0 0 0-2 2v12a2 2 0 1 0 4 0V5a2 2 0 0 0-2-2z"
                  fill="currentColor"
                />
                <path
                  v-else
                  d="M17.982 9.275 8.06 3.27A2.013 2.013 0 0 0 5 4.994v12.011a2.017 2.017 0 0 0 3.06 1.725l9.922-6.005a2.017 2.017 0 0 0 0-3.45z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </el-tooltip>

          <!-- 音量控制 -->
          <div class="volume-control">
            <div class="volume-btn-wrapper"
              @mouseenter="showVolumeSlider = true"
              @mouseleave="showVolumeSlider = false"
            >
              <button class="control-btn volume-btn" @click="toggleMute">
                <svg 
                  class="volume-icon" 
                  viewBox="0 0 22 22" 
                  xmlns="http://www.w3.org/2000/svg"
                  width="22" 
                  height="22"
                >
                  <path 
                    v-if="!isMuted && volume > 0"
                    d="M10.188 4.65 6 8H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1l4.188 3.35a.5.5 0 0 0 .812-.39V5.04a.498.498 0 0 0-.812-.39zm4.258-.872a1 1 0 0 0-.862 1.804 6.002 6.002 0 0 1-.007 10.838 1 1 0 0 0 .86 1.806A8.001 8.001 0 0 0 19 11a8.001 8.001 0 0 0-4.554-7.222z M15 11a3.998 3.998 0 0 0-2-3.465v6.93A3.998 3.998 0 0 0 15 11z"
                    fill="currentColor"
                  />
                  <path
                    v-else
                    d="M15 11a3.998 3.998 0 0 0-2-3.465v2.636l1.865 1.865A4.02 4.02 0 0 0 15 11zM4.5 5.375l15 15 1.5-1.5-15-15-1.5 1.5z M10.188 4.65 6 8H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1l4.188 3.35a.5.5 0 0 0 .812-.39V5.04a.498.498 0 0 0-.812-.39z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <div class="volume-slider" 
                v-show="showVolumeSlider"
                ref="volumeRef"
                @click="handleVolumeClick"
              >
                <div class="volume-progress" :style="{ width: volume * 100 + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- 时间显示 -->
          <span class="time-display">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </span>
        </div>

        <div class="right-controls">
          <!-- 播放速度 -->
          <el-dropdown trigger="click" @command="handleSpeedChange">
            <button class="control-btn speed-btn">
              <span class="speed-text">{{ playbackRate }}x</span>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="rate in speedOptions" 
                  :key="rate" 
                  :command="rate"
                >
                  {{ rate }}x
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 全屏按钮 -->
          <button class="control-btn fullscreen-btn" @click="toggleFullscreen">
            <el-icon><FullScreen v-if="!isFullscreen" /><Aim v-else /></el-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- 播放结束遮罩 -->
    <div class="end-overlay" v-if="isEnded" @click="replayVideo">
      <div class="replay-button">
        <el-icon><RefreshRight /></el-icon>
        重新播放
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  VideoPlay, VideoPause, Microphone, Mute, 
  FullScreen, Aim, RefreshRight 
} from '@element-plus/icons-vue'

// Props定义
const props = defineProps({
  videoUrl: {
    type: String,
    required: true
  },
  poster: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  }
})

// 基础状态
const videoRef = ref(null)
const progressRef = ref(null)
const volumeRef = ref(null)
const showTitle = ref(false)
const isPlaying = ref(false)
const isEnded = ref(false)
const isMuted = ref(false)
const isFullscreen = ref(false)
const duration = ref(0)
const currentTime = ref(0)
const volume = ref(1)
const loadedProgress = ref(0)
const currentProgress = ref(0)
const playbackRate = ref(1)
const showTooltip = ref(false)
const tooltipPosition = ref(0)
const tooltipTime = ref('00:00')

// 播放速度选项
const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 播放控制
const togglePlay = () => {
  if (videoRef.value) {
    if (isPlaying.value) {
      videoRef.value.pause()
    } else {
      videoRef.value.play()
    }
  }
}

// 音量控制
const toggleMute = () => {
  if (videoRef.value) {
    videoRef.value.muted = !videoRef.value.muted
    isMuted.value = videoRef.value.muted
  }
}

const handleVolumeClick = (e) => {
  const rect = volumeRef.value.getBoundingClientRect()
  const clickPosition = e.clientX - rect.left
  const newVolume = Math.max(0, Math.min(1, clickPosition / rect.width))
  if (videoRef.value) {
    videoRef.value.volume = newVolume
    volume.value = newVolume
    isMuted.value = newVolume === 0
  }
}

// 进度控制
const handleProgressClick = (e) => {
  const progressRect = progressRef.value.getBoundingClientRect()
  const offsetX = e.clientX - progressRect.left
  const progress = (offsetX / progressRect.width) * 100
  
  // 更新进度条位置
  currentProgress.value = progress
  
  // 更新视频时间
  const newTime = (duration.value * progress) / 100
  videoRef.value.currentTime = newTime
}

const handleProgressHover = (e) => {
  if (isDragging.value) return // 如果正在拖动，不处理悬停
  
  const rect = progressRef.value.getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  
  // 更新tooltip位置和时间
  tooltipPosition.value = offsetX
  const hoverTime = (offsetX / rect.width) * duration.value
  tooltipTime.value = formatTime(hoverTime)
  showTooltip.value = true
}

const hideTimeTooltip = () => {
  showTooltip.value = false
}

// 播放速度控制
const handleSpeedChange = (rate) => {
  if (videoRef.value) {
    videoRef.value.playbackRate = rate
    playbackRate.value = rate
  }
}

// 全屏控制
const toggleFullscreen = async () => {
  if (!document.fullscreenElement) {
    await videoRef.value.parentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    await document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 重新播放
const replayVideo = () => {
  if (videoRef.value) {
    videoRef.value.currentTime = 0
    videoRef.value.play()
    isEnded.value = false
  }
}

// 事件处理
const handlePlay = () => {
  isPlaying.value = true
  isEnded.value = false
}

const handlePause = () => {
  isPlaying.value = false
}

const handleEnded = () => {
  isPlaying.value = false
  isEnded.value = true
}

const handleTimeUpdate = () => {
  if (videoRef.value && !isDragging.value) {
    currentTime.value = videoRef.value.currentTime
    currentProgress.value = (currentTime.value / duration.value) * 100
    
    // 更新已加载进度
    if (videoRef.value.buffered.length > 0) {
      loadedProgress.value = (videoRef.value.buffered.end(0) / duration.value) * 100
    }
  }
}

const handleLoadedMetadata = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
    volume.value = videoRef.value.volume
  }
}

const handleVolumeChange = () => {
  if (videoRef.value) {
    volume.value = videoRef.value.volume
    isMuted.value = videoRef.value.muted
  }
}

// 添加新的响应式变量
const isDragging = ref(false)
const initialX = ref(0)
const initialProgress = ref(0)

// 开始拖动
const startDragging = (e) => {
  isDragging.value = true
  initialX.value = e.clientX
  initialProgress.value = currentProgress.value
  
  // 添加全局事件监听
  document.addEventListener('mousemove', handleDragging)
  document.addEventListener('mouseup', stopDragging)
}

// 拖动过程
const handleDragging = (e) => {
  if (!isDragging.value) return
  
  e.preventDefault()
  
  const progressRect = progressRef.value.getBoundingClientRect()
  const progressWidth = progressRect.width
  
  // 计算鼠标在进度条上的相对位置
  const offsetX = Math.max(0, Math.min(e.clientX - progressRect.left, progressWidth))
  const newProgress = (offsetX / progressWidth) * 100
  
  // 更新进度条位置
  currentProgress.value = newProgress
  
  // 同时更新当前时间显示，但不更新视频时间
  currentTime.value = (duration.value * newProgress) / 100
}

// 停止拖动
const stopDragging = () => {
  if (isDragging.value) {
    // 更新视频时间
    const newTime = (duration.value * currentProgress.value) / 100
    videoRef.value.currentTime = newTime
    
    // 重置拖动状态
    isDragging.value = false
    document.removeEventListener('mousemove', handleDragging)
    document.removeEventListener('mouseup', stopDragging)
  }
}

// 组件生命周期
onMounted(() => {
  // 监听全屏变化
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

onUnmounted(() => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
  document.removeEventListener('fullscreenchange', () => {})
  document.removeEventListener('mousemove', handleDragging)
  document.removeEventListener('mouseup', stopDragging)
})

// 添加到现有的响应式变量中
const showVolumeSlider = ref(false)
</script>

<style scoped>
.video-player {
  width: 100%;
  background: #000;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 16 / 9;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 自定义播放器控件样式 */
.video-element::-webkit-media-controls-panel {
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
}

.video-element::-webkit-media-controls-play-button {
  border-radius: 50%;
  transition: all 0.3s;
}

.video-element::-webkit-media-controls-timeline {
  border-radius: 2px;
}

.video-element::-webkit-media-controls-volume-slider {
  border-radius: 2px;
}

.video-element::-webkit-media-controls-mute-button {
  border-radius: 50%;
}

/* 视频标题样式 */
.video-title {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: linear-gradient(rgba(0, 0, 0, 0.7), transparent);
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  z-index: 2;
  transition: opacity 0.3s;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  pointer-events: none;  /* 防止标题遮挡视频控制 */
}

/* 自定义控制栏样式 */
.custom-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

.video-player:hover .custom-controls {
  opacity: 1;
}

/* 优化进度条样式 */
.progress-bar {
  position: relative;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: height 0.2s;
  margin-bottom: 10px;
  user-select: none; /* 防止拖动时选中文本 */
}

.progress-current {
  position: absolute;
  left: 0; /* 确保从左侧开始 */
  top: 0;
  height: 100%;
  background: #fb7299;
  transition: none;
  pointer-events: none; /* 防止干扰拖动 */
}

.progress-handle {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #fb7299;
  border-radius: 50%;
  border: 2px solid #fff;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
  z-index: 2; /* 确保手柄在最上层 */
}

/* 修改拖动状态样式 */
.progress-bar:hover .progress-handle,
.progress-handle.is-dragging {
  opacity: 1;
}

.progress-current.is-dragging {
  transition: none;
}

/* 确保加载进度条不影响拖动 */
.progress-loaded {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
  pointer-events: none;
  z-index: 1;
}

.time-tooltip {
  position: absolute;
  top: -30px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* 控制栏样式 */
.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
}

.left-controls,
.right-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-btn {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: all 0.3s;
}

.control-btn:hover {
  color: #fb7299;
}

/* 音量控制样式 */
.volume-control {
  position: relative;
  display: flex;
  align-items: center;
}

.volume-btn-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-slider {
  width: 0;  /* 初始宽度为0 */
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
  overflow: hidden;  /* 防止进度条溢出 */
  transition: width 0.3s ease;  /* 添加宽度过渡效果 */
  opacity: 0;  /* 初始透明度为0 */
}

.volume-btn-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-btn-wrapper:hover .volume-slider {
  width: 60px;  /* 悬停时展开到完整宽度 */
  opacity: 1;   /* 悬停时完全显示 */
}

.volume-progress {
  position: absolute;
  height: 100%;
  background: #fff;
  border-radius: 2px;
  transition: all 0.2s ease;  /* 平滑过渡所有属性变化 */
}

/* 优化悬停效果 */
.volume-slider:hover .volume-progress {
  background: #fb7299;
  transform: scaleY(1.2);  /* 悬停时略微放大 */
}

/* 播放结束遮罩样式 */
.end-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.replay-button {
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  padding: 12px 24px;
  border-radius: 4px;
  background: rgba(251, 114, 153, 0.9);
  transition: all 0.3s;
}

.replay-button:hover {
  background: #fb7299;
  transform: scale(1.05);
}

/* 其他辅助样式 */
.time-display {
  font-size: 14px;
  color: #fff;
  min-width: 85px;
}

:deep(.el-icon) {
  font-size: 20px;
}

.speed-text {
  color: #fff;
  font-size: 14px;
}

/* 悬停效果 */
.progress-bar:hover {
  height: 6px;
}

.progress-bar:hover .progress-handle {
  opacity: 1;
}

.progress-bar:hover .progress-current {
  background: #fb7299;
}

.play-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.play-icon {
  display: block;
  transition: transform 0.2s;
}

.play-button:hover .play-icon {
  transform: scale(1.1);
}

/* 修改按钮样式 */
.play-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;  /* 设置按钮容器的宽度 */
  height: 40px; /* 设置按钮容器的高度 */
  padding: 6px; /* 调整内边距来控制图标与按钮边缘的距离 */
}

.play-icon {
  width: 100%;    /* 让图标填充按钮容器 */
  height: 100%;
  color: #ffffff; /* 设置图标颜色 */
}

/* 悬停效果 */
.play-btn:hover .play-icon {
  transform: scale(1.1);
  color: #fb7299; /* 悬停时改变颜色 */
}

/* 调整tooltip样式 */
:deep(.el-tooltip__trigger) {
  outline: none;
}

:deep(.el-popper.is-dark) {
  background: rgba(0, 0, 0, 0.8);
  padding: 4px 8px;
}

/* 添加音量按钮样式 */
.volume-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 6px;
}

.volume-icon {
  width: 100%;
  height: 100%;
  color: #ffffff;
  transition: transform 0.2s;
}

.volume-btn:hover .volume-icon {
  transform: scale(1.1);
  color: #fb7299;
}

/* 添加浮动播放按钮样式 */
.float-play-btn {
  position: absolute;
  right: 20px;
  bottom: 70px; /* 控制栏上方 */
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  z-index: 3;
  filter: drop-shadow(0 1px 1px #000);
  transition: all 0.3s ease;
}

.float-play-btn:hover {
  color: #fb7299;
  transform: scale(1.1);
}

/* 确保按钮在控制栏显示时也可见 */
.video-player:hover .float-play-btn {
  bottom: 80px;
}
</style> 