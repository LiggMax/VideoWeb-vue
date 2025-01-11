<template>
  <div class="video-player">
    <div class="artplayer-app"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Artplayer from 'artplayer'
import artplayerPluginDanmuku from 'artplayer-plugin-danmuku'
import { useRouter } from 'vue-router'
import eventBus from '@/utils/eventBus'
import { sendBarrageService, getBarrageService } from '@/api/barrage'
import { ElMessage } from 'element-plus'
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
  },
  videoId: {
    type: [String, Number],
    required: true
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
      state: `<img src="https://s1.hdslb.com/bfs/static/player/img/play.svg" class="art-state-icon">`,
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
    },
    plugins: [
      artplayerPluginDanmuku({
        // 获取弹幕数据
        danmuku: async () => {
          try {
            const response = await getBarrageService(props.videoId)
            if (response.code === 0) {
              // 假设后端返回的弹幕数据需要转换成插件需要的格式
              return response.data.map(item => ({
                text: item.text, // 弹幕内容
                time: item.time, // 弹幕出现时间
                color: item.color || '#FFFFFF', // 弹幕颜色，如果没有则使用默认白色
                type: item.type || 0, // 弹幕类型，如果没有则使用默认滚动类型
                border: false, // 是否显示描边
              }))
            }
            return []
          } catch (error) {
            console.error('获取弹幕失败:', error)
            ElMessage.error('获取弹幕失败')
            return []
          }
        },
        speed: 5, // 弹幕速度
        opacity: 1, // 透明度
        fontSize: 25, // 字号大小
        color: '#FFFFFF', // 默认颜色
        mode: 0, // 默认模式：滚动
        margin: [10, '25%'], // 弹幕上下边距
        antiOverlap: true, // 防重叠
        useWorker: true, // 使用 web worker
        synchronousPlayback: false, // 同步播放速度
        maxLength: 100, // 最大字数限制
        minWidth: 200, // 最小宽度
        maxWidth: 400, // 最大宽度
        theme: 'dark', // 主题
        // 发送弹幕前的处理
        beforeEmit: async (danmu) => {
          try {
            // 构造发送弹幕的数据
            const barrageData = {
              videoId: props.videoId,
              text: danmu.text,
              time: art.value.currentTime, // 当前视频播放时间
              color: danmu.color,
              type: danmu.type
            }
            
            const response = await sendBarrageService(barrageData)
            if (response.code === 0) {
              ElMessage.success('发送弹幕成功')
              return true
            }
            ElMessage.error(response.message || '发送弹幕失败')
            return false
          } catch (error) {
            console.error('发送弹幕失败:', error)
            ElMessage.error('发送弹幕失败')
            return false
          }
        }
      })
    ]
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

  // 监听弹幕相关事件
  art.value.on('artplayerPluginDanmuku:emit', (danmu) => {
    console.log('发送弹幕:', danmu)
  })

  art.value.on('artplayerPluginDanmuku:loaded', (danmus) => {
    console.log('弹幕加载完成, 总数:', danmus.length)
  })

  art.value.on('artplayerPluginDanmuku:error', (error) => {
    console.error('弹幕错误:', error)
    ElMessage.error('弹幕系统出现错误')
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

/* 自定义播放状态图标样式 */
:deep(.art-video-player .art-state) {
  position: absolute;
  right: 30px;  /* 距离右边距离 */
  bottom: 70px; /* 距离底部距离，避免与控制栏重叠 */
  left: auto;   /* 取消默认的左侧定位 */
  top: auto;    /* 取消默认的顶部定位 */
  transform: none; /* 取消默认的居中变换 */
  background: none;
  padding: 0;   /* 移除内边距 */
}

:deep(.art-state-icon) {
  width: 80px;  /* 增加图标尺寸 */
  height: 80px; /* 增加图标尺寸 */
  filter: brightness(0) invert(1); /* 将图标转为白色 */
  opacity: 0.9;
  transition: all 0.3s ease;
}

:deep(.art-state:hover .art-state-icon) {
  opacity: 1;
  transform: scale(1.1);
}

/* 确保图标在暗色背景下可见 */
:deep(.art-state-playing) {
  display: none !important; /* 播放时隐藏图标 */
}
</style> 