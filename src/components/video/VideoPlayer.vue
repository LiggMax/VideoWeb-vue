<template>
  <div class="video-player">
    <div class="artplayer-app"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Artplayer from 'artplayer'
import { useRouter } from 'vue-router'
import eventBus from '@/utils/eventBus'
import PlayIcon from '@/components/icons/PlayIcon.vue'

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
  }
})

const emit = defineEmits(['toggle-collapse'])
const router = useRouter()
const art = ref(null)

// 初始化播放器
const initPlayer = () => {
  if (art.value) return

  // 检查视频URL是否有效
  if (!props.videoUrl) {
    console.error('视频URL无效')
    return
  }

  art.value = new Artplayer({
    container: '.artplayer-app',
    url: props.videoUrl,
    poster: props.poster,
    title: props.title,
    volume: 0.5,
    isLive: false,
    muted: false,
    autoplay: false,
    pip: true,
    autoSize: true,
    autoMini: true,
    screenshot: true,
    setting: true,
    loop: false,
    flip: true,
    rotate: true,
    playbackRate: true,
    aspectRatio: true,
    fullscreen: true,
    fullscreenWeb: true,
    subtitleOffset: true,
    miniProgressBar: true,
    mutex: true,
    backdrop: true,
    playsInline: true,
    autoPlayback: true,
    airplay: true,
    theme: '#fb7299',
    lang: 'zh-cn',
    moreVideoAttr: {
      crossOrigin: 'anonymous',
    },
    controls: [
      {
        position: 'right',
        html: '画中画',
        click: function () {
          art.value.pip = !art.value.pip
        },
      },
    ],
    settings: [
      {
        width: 200,
        html: '画质',
        selector: [
          {
            html: '自动',
            default: true,
            url: props.videoUrl
          }
        ],
      },
    ],
    icons: {
      loading: '<img src="/loading.gif">',
      play: `<svg viewBox="0 0 24 24"><path d="M17.982 9.275 8.06 3.27A2.013 2.013 0 0 0 5 4.994v12.011a2.017 2.017 0 0 0 3.06 1.725l9.922-6.005a2.017 2.017 0 0 0 0-3.45z" fill="currentColor"/></svg>`,
    },
    quality: [
      {
        default: true,
        html: '自动',
        url: props.videoUrl
      }
    ],
    thumbnails: {
      url: props.poster,
      number: 60,
      column: 10,
    }
  })

  // 监听播放器事件
  art.value.on('ready', () => {
    console.log('视频播放器已就绪')
  })

  art.value.on('play', () => {
    console.log('视频开始播放')
  })

  art.value.on('pause', () => {
    console.log('视频暂停')
  })

  // 错误处理
  art.value.on('error', (error) => {
    console.error('视频播放错误:', error)
    ElMessage.error('视频加载失败，请稍后重试')
  })

  // 监听全屏事件
  art.value.on('fullscreen', (state) => {
    emit('toggle-collapse', state)
  })

  // 监听网页全屏事件
  art.value.on('fullscreenWeb', (state) => {
    emit('toggle-collapse', state)
  })
}

// 监听 URL 变化
watch(() => props.videoUrl, (newUrl, oldUrl) => {
  if (newUrl && newUrl !== oldUrl) {
    if (art.value) {
      // 如果播放器已存在，更新视频源
      art.value.url = newUrl
      art.value.poster = props.poster
      art.value.title = props.title
    } else {
      // 如果播放器不存在，初始化播放器
      initPlayer()
    }
  }
}, { immediate: true })

// 组件挂载时初始化播放器
onMounted(() => {
  if (props.videoUrl) {
    initPlayer()
  }
})

// 组件卸载时销毁播放器
onUnmounted(() => {
  if (art.value && art.value.destroy) {
    art.value.destroy()
    art.value = null
  }
})
</script>

<style scoped>
.video-player {
  width: 100%;
  background: #000;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 16/9;
  max-width: 100%;
  margin: 0 auto;
}

.artplayer-app {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

:deep(.art-video-player) {
  width: 100% !important;
  height: 100% !important;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
}

:deep(.art-subtitle) {
  bottom: 10px;
  font-size: 16px;
  text-shadow: 0.5px 0.5px 0.5px rgba(0, 0, 0, 0.5);
}

/* 自定义主题色 */
:deep(.art-video-player .art-control-progress) {
  background: rgba(255, 255, 255, 0.2);
}

:deep(.art-video-player .art-control-progress .art-control-progress-inner) {
  background: #fb7299;
}

:deep(.art-video-player .art-control-progress .art-control-progress-inner .art-control-progress-dot) {
  border-color: #fb7299;
}

:deep(.art-video-player .art-control-progress:hover .art-control-progress-inner) {
  height: 5px;
}

/* 响应式调整 */
@media screen and (max-width: 1200px) {
  .video-player {
    border-radius: 2px;
  }
}

@media screen and (max-width: 768px) {
  .video-player {
    border-radius: 0;
  }
  
  :deep(.art-subtitle) {
    font-size: 14px;
  }
}
</style> 