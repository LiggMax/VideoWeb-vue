<template>
  <div class="video-player"
    @mousemove="showControls"
    @mouseleave="startHideControlsTimer"
    @click="handleVideoClick"
    @dblclick="toggleFullscreen"
  >
    <div class="video-title" v-show="showTitle">
      {{ title }}
    </div>
    
    <!-- 播放器主体 -->
    <video
      ref="videoRef"
      class="video-element"
      :class="{ 'playing': isPlaying }"
      :src="videoUrl"
      :poster="poster"
      @play="handlePlay"
      @pause="handlePause"
      @ended="handleEnded"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @volumechange="handleVolumeChange"
      @waiting="handleWaiting"
      @canplay="handleCanPlay"
      @mouseover="showTitle = true"
      @mouseleave="showTitle = false"
    >
      您的浏览器不支持 HTML5 视频播放
    </video>

    <!-- 添加加载动画 -->
    <div class="loading-overlay" v-show="isLoading">
      <div class="loading-spinner">
        <svg viewBox="25 25 50 50" class="circular">
          <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
        </svg>
        <span class="loading-text">视频加载中...</span>
      </div>
    </div>

    <!-- 在自定义控制栏之前添加 -->
    <div class="float-play-btn" 
      v-show="!isPlaying && !isEnded && isControlsVisible" 
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
    <div class="custom-controls" 
      v-show="isControlsVisible && !isEnded"
      @mouseenter="showControls"
      @mouseleave="startHideControlsTimer"
    >
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
              <PauseIcon v-if="isPlaying" />
              <PlayIcon v-else />
            </button>
          </el-tooltip>

          <!-- 音量控制 -->
          <div class="volume-control">
            <div class="volume-btn-wrapper"
              @mouseenter="showVolumeSlider = true"
              @mouseleave="showVolumeSlider = false"
            >
              <button class="control-btn volume-btn" @click="toggleMute">
                <MuteIcon v-if="isMuted || volume === 0" />
                <VolumeIcon v-else />
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
            <ExitFullscreenIcon v-if="isFullscreen" />
            <FullscreenIcon v-else />
          </button>
        </div>
      </div>
    </div>

    <!-- 播放结束遮罩 -->
    <div class="end-overlay" v-if="isEnded" @click="replayVideo">
      <div class="replay-button">
        <RefreshIcon />
        重新播放
      </div>
    </div>

    <!-- 添加收缩按钮 -->
    <div class="collapse-trigger" 
      v-show="isControlsVisible"
      @click="$emit('toggle-collapse')" 
      :class="{ 'is-collapsed': isCollapsed }"
    >
      <div class="collapse-btn">
        <CollapseIcon />
      </div>
    </div>

    <!-- 音量提示 -->
    <div class="volume-indicator" v-show="showVolumeIndicator">
      <div class="volume-indicator-content">
        <div class="volume-icon">
          <MuteIcon v-if="volume === 0" />
          <VolumeIcon v-else />
        </div>
        <div class="volume-control-wrapper">
          <div class="volume-bar">
            <div class="volume-bar-fill" :style="{ width: volume * 100 + '%' }"></div>
          </div>
          <div class="volume-value">{{ Math.round(volume * 100) }}%</div>
        </div>
      </div>
    </div>

    <!-- 添加播放记录提示 -->
    <Transition name="fade">
      <div class="resume-tip" v-if="showResumeTip">
        <div class="resume-tip-content">
          <div class="resume-tip-title">继续播放</div>
          <div class="resume-tip-time">从 {{ formatTime(resumeTime) }} 继续播放</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import VolumeIcon from '../icons/VolumeIcon.vue'
import MuteIcon from '../icons/MuteIcon.vue'
import PlayIcon from '../icons/PlayIcon.vue'
import PauseIcon from '../icons/PauseIcon.vue'
import FullscreenIcon from '../icons/FullscreenIcon.vue'
import ExitFullscreenIcon from '../icons/ExitFullscreenIcon.vue'
import RefreshIcon from '../icons/RefreshIcon.vue'
import CollapseIcon from '../icons/CollapseIcon.vue'

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
  },
  isCollapsed: {
    type: Boolean,
    default: false
  },
  autoplay: {
    type: Boolean,
    default: false
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
const route = useRoute()
const videoId = computed(() => route.params.id)

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
  // 清除播放进度记录
  const key = `video_progress_${videoId.value}`
  localStorage.removeItem(key)
}

const handleTimeUpdate = () => {
  if (videoRef.value && !isDragging.value) {
    currentTime.value = videoRef.value.currentTime
    currentProgress.value = (currentTime.value / duration.value) * 100
    
    // 更新已加载进度
    if (videoRef.value.buffered.length > 0) {
      loadedProgress.value = (videoRef.value.buffered.end(0) / duration.value) * 100
    }
    
    // 每秒保存一次播放位置
    if (Math.floor(currentTime.value) % 1 === 0) {
      savePlayTime(currentTime.value)
    }
  }
}

const handleLoadedMetadata = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
    volume.value = videoRef.value.volume
    isLoading.value = false
    // 设置上次播放位置
    const lastTime = getLastPlayTime()
    if (lastTime > 0) {
      videoRef.value.currentTime = lastTime
      resumeTime.value = lastTime
      showResumeTip.value = true
      setTimeout(() => {
        showResumeTip.value = false
      }, 3000)
    }
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

// 添加新的响应式变量
const isControlsVisible = ref(true)
const hideControlsTimer = ref(null)

// 修改显示控制方法
const showControls = () => {
  isControlsVisible.value = true
  // 清除之前的定时器
  if (hideControlsTimer.value) {
    clearTimeout(hideControlsTimer.value)
  }
  // 重新开始计时
  startHideControlsTimer()
}

const startHideControlsTimer = () => {
  // 清除之前的定时器
  if (hideControlsTimer.value) {
    clearTimeout(hideControlsTimer.value)
  }
  // 设置5秒后隐藏
  hideControlsTimer.value = setTimeout(() => {
    // 只有在视频播放时才自动隐藏
    if (isPlaying.value) {
      isControlsVisible.value = false
    }
  }, 5000)
}

// 在视频播放/暂停状态改变时也要处理控制栏显示
watch(isPlaying, (newValue) => {
  if (!newValue) {
    // 视频暂停时保持控制栏显示
    isControlsVisible.value = true
    if (hideControlsTimer.value) {
      clearTimeout(hideControlsTimer.value)
    }
  } else {
    // 视频播放时开始计时
    startHideControlsTimer()
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (hideControlsTimer.value) {
    clearTimeout(hideControlsTimer.value)
  }
})

// 定义事件
defineEmits(['toggle-collapse'])

// 添加点击事件处理
const handleVideoClick = (e) => {
  // 防止点击控制栏时触发
  if (e.target.closest('.custom-controls') || e.target.closest('.float-play-btn') || e.target.closest('.collapse-trigger')) {
    return
  }
  togglePlay()
}

// 添加键盘事件监听
const handleKeyPress = (e) => {
  // 空格键控制播放/暂停
  if (e.code === 'Space') {
    e.preventDefault()
    togglePlay()
  }
  // ESC 键退出全屏
  if (e.code === 'Escape' && isFullscreen.value) {
    document.exitFullscreen()
  }
  // 左右方向键控制进度
  if (e.code === 'ArrowLeft') {
    if (videoRef.value) {
      videoRef.value.currentTime = Math.max(0, videoRef.value.currentTime - 5)
    }
  }
  if (e.code === 'ArrowRight') {
    if (videoRef.value) {
      videoRef.value.currentTime = Math.min(duration.value, videoRef.value.currentTime + 5)
    }
  }
  // 上下方向键控制音量
  if (e.code === 'ArrowUp') {
    e.preventDefault()
    if (videoRef.value) {
      const newVolume = Math.min(1, volume.value + 0.1)
      videoRef.value.volume = newVolume
      volume.value = newVolume
      isMuted.value = newVolume === 0
      showVolumeHint()
    }
  }
  if (e.code === 'ArrowDown') {
    e.preventDefault()
    if (videoRef.value) {
      const newVolume = Math.max(0, volume.value - 0.1)
      videoRef.value.volume = newVolume
      volume.value = newVolume
      isMuted.value = newVolume === 0
      showVolumeHint()
    }
  }
  // M 键静音
  if (e.code === 'KeyM') {
    toggleMute()
  }
}

// 在组件挂载时添加键盘事件监听
onMounted(() => {
  document.addEventListener('keydown', handleKeyPress)
})

// 在组件卸载时移除键盘事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress)
})

// 在现有的响应式变量声明中添加
const isLoading = ref(false)

// 添加新的事件处理函数
const handleWaiting = () => {
  isLoading.value = true
}

const handleCanPlay = () => {
  isLoading.value = false
}

// 监听 videoUrl 变化，实现自动播放
watch(() => props.videoUrl, (newUrl) => {
  if (newUrl && props.autoplay) {
    // 确保视频加载完成后再播放
    nextTick(() => {
      if (videoRef.value) {
        videoRef.value.play()
      }
    })
  }
})

// 获取上次播放位置
const getLastPlayTime = () => {
  const key = `video_progress_${videoId.value}`
  const time = localStorage.getItem(key)
  // 如果播放进度超过95%，则返回0从头开始播放
  if (time && duration.value) {
    const progress = parseFloat(time) / duration.value * 100
    if (progress > 95) {
      localStorage.removeItem(key)
      return 0
    }
  }
  return time ? parseFloat(time) : 0
}

// 保存播放位置
const savePlayTime = (time) => {
  // 只有当播放进度在1%到95%之间时才保存
  if (duration.value) {
    const progress = time / duration.value * 100
    if (progress > 1 && progress < 95) {
      const key = `video_progress_${videoId.value}`
      localStorage.setItem(key, time.toString())
    }
  }
}

// 添加新的响应式变量
const showVolumeIndicator = ref(false)
let volumeIndicatorTimer = null

// 显示音量提示
const showVolumeHint = () => {
  showVolumeIndicator.value = true
  // 清除之前的定时器
  if (volumeIndicatorTimer) {
    clearTimeout(volumeIndicatorTimer)
  }
  // 设置新的定时器
  volumeIndicatorTimer = setTimeout(() => {
    showVolumeIndicator.value = false
  }, 1000)
}

// 添加新的响应式变量
const showResumeTip = ref(false)
const resumeTime = ref(0)
</script>

<style scoped>
.video-player {
  width: 100%;
  background: #000;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 16 / 9;
  user-select: none;
  -webkit-user-select: none;
  min-width: 680px;  /* 设置最小宽度 */
  min-height: 470px; /* 设置最小高度，保持16:9比例 */
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-element.playing {
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
  opacity: 1;  /* 改为始终不透明 */
  transition: opacity 0.3s;
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
  overflow: hidden;  /* 防止进度条超出 */
  transition: width 0.3s ease;  /* 添加宽度过渡效果 */
  opacity: 0;  /* 初始透明度为0 */
}

.volume-btn-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-btn-wrapper:hover .volume-slider {
  width: 60px;  /* 悬停时展开完整宽度 */
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
  width: 40px;
  height: 40px;
  padding: 8px;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

/* 修改音量按钮中的图标样式 */
.volume-btn svg {
  width: 24px;
  height: 24px;
  color: #ffffff;
  transition: transform 0.2s;
  font-size: 24px; /* 添加字体大小 */
}

/* 修改音量控制区域的布局 */
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

/* 悬停效果 */
.volume-btn:hover svg {
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

/* 修改收缩按钮样式 */
.collapse-trigger {
  position: absolute;
  right: 0;
  top: 50%;  /* 改为50% */
  transform: translateY(-50%);  /* 添加垂直居中变换 */
  height: 60px;
  width: 24px;
  transition: all 0.3s ease;
  z-index: 100;
}

.collapse-btn {
  position: absolute;
  left: 0;
  top: 0;
  width: 24px;
  height: 60px;
  background: rgba(0, 0, 0, 0.3);  /* 增加不透明度 */
  border-radius: 4px 0 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(2px);
}

.collapse-btn:hover {
  background: rgba(251, 114, 153, 0.95);  /* 悬停时更不透明 */
  width: 28px;
}

.collapse-btn .el-icon {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.95);  /* 图标也更不透明 */
  transition: transform 0.3s ease;
}

/* 修改视频播放器容器样式 */
.video-player {
  width: 100%;
  background: #000;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 16 / 9;
}

/* 悬停效果 */
.collapse-btn:hover {
  background: rgba(251, 114, 153, 0.9);
  width: 28px;
}

.collapse-btn .el-icon {
  font-size: 16px;
  color: #fff;
  transition: transform 0.3s ease;
}

.collapse-trigger.is-collapsed .el-icon {
  transform: rotate(180deg);
}

/* 在现有样式后添加加载动画相关样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-text {
  color: #fff;
  font-size: 14px;
}

.circular {
  width: 42px;
  height: 42px;
  animation: loading-rotate 2s linear infinite;
}

.path {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-width: 3;
  stroke: #fb7299;
  stroke-linecap: round;
  animation: loading-dash 1.5s ease-in-out infinite;
}

@keyframes loading-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40px;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120px;
  }
}

/* 在小屏幕上允许播放器缩小到更小尺寸 */
@media screen and (max-width: 768px) {
  .video-player {
    min-width: 320px;
    min-height: 180px;
  }
}

/* 全局样式，需要添加到 App.vue 或全局样式文件中 */
:deep(.volume-message) {
  background-color: rgba(0, 0, 0, 0.7) !important;
  border: none !important;
  padding: 8px 16px !important;
}

:deep(.volume-message .el-message__content) {
  color: #fff !important;
  font-size: 14px !important;
}

:deep(.volume-message .el-message__icon) {
  display: none !important;
}

/* 修改音量提示样式 */
.volume-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.5); /* 进一步降低背景透明度 */
  backdrop-filter: blur(6px); /* 减少模糊效果 */
  border-radius: 8px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.85); /* 降低文字透明度 */
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* 降低阴影透明度 */
  border: 1px solid rgba(255, 255, 255, 0.06); /* 降低边框透明度 */
}

.volume-indicator-content {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 200px;
}

.volume-icon {
  font-size: 28px; /* 统一设置图标大小 */
  color: rgba(251, 114, 153, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;  /* 统一容器大小 */
  height: 40px;
  background: rgba(251, 114, 153, 0.06);
  border-radius: 8px;
  animation: scaleIcon 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 确保SVG图标在容器中居中且大小一致 */
.volume-icon svg {
  width: 28px;
  height: 28px;
}

.volume-control-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.volume-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1); /* 降低进度条背景透明度 */
  border-radius: 2px;
  overflow: hidden;
}

.volume-bar-fill {
  height: 100%;
  background: rgba(251, 114, 153, 0.8); /* 降低进度条填充透明度 */
  border-radius: 2px;
  transition: width 0.2s ease;
}

.volume-value {
  font-size: 14px;
  font-weight: 500;
  min-width: 40px;
  text-align: right;
  color: rgba(255, 255, 255, 0.85); /* 降低数值文字透明度 */
  animation: fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes scaleIcon {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  0% {
    transform: translateY(10px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.volume-indicator-enter-active,
.volume-indicator-leave-active {
  transition: opacity 0.3s ease;
}

.volume-indicator-enter-from,
.volume-indicator-leave-to {
  opacity: 0;
}

/* 修改全屏按钮样式 */
.fullscreen-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 6px;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.fullscreen-btn svg {
  width: 20px;
  height: 20px;
}

.fullscreen-btn:hover {
  color: #fb7299;
  transform: scale(1.1);
}

/* 确保所有控制按钮的基础样式 */
.control-btn {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.control-btn svg {
  width: 100%;
  height: 100%;
}

.control-btn:hover {
  color: #fb7299;
}

/* 播放记录提示样式 */
:deep(.resume-notification) {
  background: rgba(0, 0, 0, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(8px) !important;
  padding: 12px 16px !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
  min-width: 240px !important;
}

:deep(.resume-message) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:deep(.resume-title) {
  color: #fff !important;
  font-size: 14px !important;
  font-weight: 500 !important;
}

:deep(.resume-time) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 13px !important;
}

:deep(.el-message__content) {
  padding: 0 !important;
  line-height: 1.4 !important;
}

:deep(.el-message .el-message__badge) {
  display: none !important;
}

/* 添加播放记录提示样式 */
.resume-tip {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: transparent;
  border-radius: 8px;
  padding: 12px 16px;
  z-index: 100;
  min-width: 200px;
}

.resume-tip-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.resume-tip-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
}

.resume-tip-time {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

/* 添加淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移除原来的ElMessage相关样式 */
:deep(.resume-notification),
:deep(.resume-message),
:deep(.resume-title),
:deep(.resume-time),
:deep(.el-message__content),
:deep(.el-message .el-message__badge) {
  display: none !important;
}
</style> 