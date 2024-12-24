<template>
  <div class="video-player"
       @mousemove="showControls"
       @mouseleave="startHideControlsTimer"
       @click="handleVideoClick"
       @dblclick="toggleFullscreen"
  >
    <!-- 弹幕画布 -->
    <DanmakuCanvas
        ref="danmakuCanvasRef"
        :videoId="videoId"
        :show="showDanmaku"
        :opacity="0.8"
        :currentTime="currentTime"
        :isPlaying="isPlaying"
    />

    <div class="video-title">
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
         @click.stop
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
              <PauseIcon v-if="isPlaying"/>
              <PlayIcon v-else/>
            </button>
          </el-tooltip>

          <!-- 音量控制 -->
          <div class="volume-control">
            <div class="volume-btn-wrapper"
                 @mouseenter="showVolumeSlider = true"
                 @mouseleave="showVolumeSlider = false"
            >
              <button class="control-btn volume-btn" @click="toggleMute">
                <MuteIcon v-if="isMuted || volume === 0"/>
                <VolumeIcon v-else/>
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
          <span class="time-display" 
                :class="{ 'hide-on-small': isSmallPlayer }"
          >
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </span>
        </div>

        <!-- 弹幕输入区域 -->
        <div class="danmaku-input-area">
          <DanmakuColorPicker
            v-model="danmakuColor"
            class="danmaku-color-picker"
            :class="{ 'hide-on-small': isSmallPlayer }"
          />

          <DanmakuToggle v-model="showDanmaku"/>

          <el-input
              v-model="danmakuText"
              placeholder="发个友善的弹幕见证当下"
              class="danmaku-input"
              :class="{ 'hide-on-small': isSmallPlayer }"
              @keyup.enter="sendDanmaku"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
          >
            <template #append>
              <el-button @click="sendDanmaku" type="primary">
                发送
              </el-button>
            </template>
          </el-input>

          <DanmakuSettings 
            @update="updateDanmakuSettings"
            :class="{ 'hide-on-small': isSmallPlayer }"
          />
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
            <ExitFullscreenIcon v-if="isFullscreen"/>
            <FullscreenIcon v-else/>
          </button>
        </div>
      </div>
    </div>

    <!-- 播放结束遮罩 -->
    <div class="end-overlay" v-if="isEnded" @click="replayVideo">
      <div class="replay-button">
        <RefreshIcon/>
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
        <CollapseIcon/>
      </div>
    </div>

    <!-- 音量提示 -->
    <div class="volume-indicator" v-show="showVolumeIndicator">
      <div class="volume-indicator-content">
        <div class="volume-icon">
          <MuteIcon v-if="volume === 0"/>
          <VolumeIcon v-else/>
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
import {ref, onMounted, onUnmounted, watch, computed} from 'vue'
import {useRoute} from 'vue-router'
import VolumeIcon from '@/components/icons/VolumeIcon.vue'
import MuteIcon from '@/components/icons/MuteIcon.vue'
import PlayIcon from '@/components/icons/PlayIcon.vue'
import PauseIcon from '@/components/icons/PauseIcon.vue'
import FullscreenIcon from '@/components/icons/FullscreenIcon.vue'
import ExitFullscreenIcon from '@/components/icons/ExitFullscreenIcon.vue'
import RefreshIcon from '@/components/icons/RefreshIcon.vue'
import CollapseIcon from '@/components/icons/CollapseIcon.vue'
import DanmakuColorPicker from '@/components/video/DanmakuColorPicker.vue'
import DanmakuToggle from '@/components/video/DanmakuToggle.vue'
import {sendBarrageService} from '@/api/barrage'
import {ElMessage} from 'element-plus'
import DanmakuCanvas from './DanmakuCanvas.vue'
import { Setting } from '@element-plus/icons-vue'
import DanmakuSettings from './DanmakuSettings.vue'

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
  checkPlayerSize()  // 初始检查
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
  document.removeEventListener('fullscreenchange', () => {
  })
  document.removeEventListener('mousemove', handleDragging)
  document.removeEventListener('mouseup', stopDragging)
  window.removeEventListener('resize', handleResize)
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
  // 设置5秒后隐藏，但如果输入框被聚焦不隐藏
  hideControlsTimer.value = setTimeout(() => {
    // 只有在视频播放且输入框未被聚焦时才自动隐藏
    if (isPlaying.value && !isInputFocused.value) {
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

// 修改点击事件处理函数
const handleVideoClick = (event) => {
  // 排除不应该触发播放/暂停的元素
  const excludedElements = [
    '.custom-controls',
    '.float-play-btn',
    '.collapse-trigger',
    '.danmaku-canvas'
  ]
  
  if (excludedElements.some(selector => event.target.closest(selector))) {
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

// 添加��的响应式变量
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

// 弹幕输入控制
const danmakuText = ref('')

// 弹幕颜色
const danmakuColor = ref('#FFFFFF')

// 添加弹幕画布引用
const danmakuCanvasRef = ref(null)

// 修改发送弹幕的方法
const sendDanmaku = async () => {
  if (!danmakuText.value.trim()) return

  const danmakuData = {
    videoId: videoId.value,
    content: danmakuText.value.trim(),
    color: danmakuColor.value,
    timePoint: Math.floor(currentTime.value)
  }

  await sendBarrageService(danmakuData)
  ElMessage.success('弹幕发送成功')

  // 立即在画布上显示弹幕
  danmakuCanvasRef.value?.addDanmaku(danmakuData.content, danmakuColor.value)

  danmakuText.value = ''

  // 发送弹幕后让输入框失去焦点
  const input = document.querySelector('.danmaku-input input')
  if (input) {
    input.blur()
  }
}

// 添��新的响应式变量
const showDanmaku = ref(true)

// 切换弹幕开关
const toggleDanmaku = () => {
  showDanmaku.value = !showDanmaku.value
}

// 添加更新设置的方法
const updateDanmakuSettings = (settings) => {
  if (danmakuCanvasRef.value) {
    danmakuCanvasRef.value.updateSettings(settings)
  }
}

// 添加新的响应式变量
const isInputFocused = ref(false)

// 添加输入框焦点处理方法
const handleInputFocus = () => {
  isInputFocused.value = true
  // 确保控制栏显示
  isControlsVisible.value = true
  // 清除隐藏定时器
  if (hideControlsTimer.value) {
    clearTimeout(hideControlsTimer.value)
  }
}

const handleInputBlur = () => {
  isInputFocused.value = false
  // 重新开始隐藏计时
  startHideControlsTimer()
}

// 添加播放器尺寸检测
const isSmallPlayer = ref(false)

// 检查播放器尺寸
const checkPlayerSize = () => {
  if (videoRef.value) {
    const playerWidth = videoRef.value.offsetWidth
    isSmallPlayer.value = playerWidth < 750  // 调整阈值为750px
  }
}

// 监听窗口大小变化
const handleResize = () => {
  checkPlayerSize()
}
</script>

<style lang="scss">
@import '@/styles/components/video/player';
@import '@/styles/components/video/controls';
@import '@/styles/components/video/volume';
@import '@/styles/components/video/loading';

/* 更新弹幕输入区域样式 */
.danmaku-input-area {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .danmaku-input {
    flex: 1;
    transition: all 0.3s;
    
    &.hide-on-small {
      @media screen and (max-width: 750px) {
        display: none;
      }
    }
  }
  
  .danmaku-color-picker,
  .danmaku-settings-trigger {
    transition: all 0.3s;
    
    &.hide-on-small {
      @media screen and (max-width: 750px) {
        display: none;
      }
    }
  }
}

.time-display {
  color: #fff;
  font-size: 14px;
  margin: 0 12px;
  transition: opacity 0.3s;
  
  &.hide-on-small {
    @media screen and (max-width: 750px) {
      display: none;
    }
  }
}

/* 在小屏幕下调整弹幕开关按钮的样式 */
@media screen and (max-width: 750px) {
  .danmaku-toggle {
    margin-left: auto; /* 将弹幕开关按钮推到右侧 */
  }
}
</style> 