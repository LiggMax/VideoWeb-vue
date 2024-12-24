<template>
  <canvas 
    ref="canvasRef"
    class="danmaku-canvas"
    :style="{
      display: show ? 'block' : 'none',
      opacity: opacity
    }"
  ></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getBarrageService } from '@/api/barrage'

const props = defineProps({
  videoId: {
    type: [String, Number],
    required: true
  },
  show: {
    type: Boolean,
    default: true
  },
  opacity: {
    type: Number,
    default: 1
  },
  currentTime: {
    type: Number,
    default: 0
  }
})

const canvasRef = ref(null)
const ctx = ref(null)
const danmakus = ref([])
const activeDanmakus = ref([])
const animationFrame = ref(null)

// Canvas 尺寸设置
const resize = () => {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const container = canvas.parentElement
  canvas.width = container.offsetWidth
  canvas.height = container.offsetHeight
}

// 初始化 Canvas
const initCanvas = () => {
  if (!canvasRef.value) return
  ctx.value = canvasRef.value.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
}

// 添加默认设置
const settings = ref({
  opacity: 0.8,
  fontSize: 24,
  speed: 2,
  area: 'h50'  // 默认使用半屏
})

// 添加更新设置的方法
const updateSettings = (newSettings) => {
  settings.value = {
    ...settings.value,
    ...newSettings
  }
  
  // 更新画布透明度
  if (canvasRef.value) {
    canvasRef.value.style.opacity = settings.value.opacity
  }
}

// 从 localStorage 获取保存的设置
const initSettings = () => {
  const saved = localStorage.getItem('danmaku_settings')
  if (saved) {
    const savedSettings = JSON.parse(saved)
    updateSettings({
      opacity: savedSettings.opacity,
      fontSize: {
        small: 18,
        medium: 24,
        large: 30
      }[savedSettings.size],
      speed: {
        slow: 1,
        normal: 2,
        fast: 3
      }[savedSettings.speed],
      area: savedSettings.area
    })
  }
}

// 弹幕类
class Danmaku {
  constructor(content, color) {
    const canvas = canvasRef.value
    this.content = content
    this.color = color
    this.speed = settings.value.speed
    this.fontSize = settings.value.fontSize
    this.x = canvas.width
    this.y = this.calculateY()
    this.width = 0
    this.measured = false
  }

  calculateY() {
    const canvas = canvasRef.value
    const area = settings.value.area
    let minY, maxY
    
    // 从顶部开始计算显示区域
    minY = this.fontSize
    maxY = canvas.height * (parseInt(area.replace('h', '')) / 100) - this.fontSize
    
    return Math.random() * (maxY - minY) + minY
  }

  measure(context) {
    if (!this.measured) {
      context.font = `${this.fontSize}px "Microsoft YaHei", sans-serif`
      this.width = context.measureText(this.content).width
      this.measured = true
    }
  }

  update() {
    this.x -= this.speed
    return this.x + this.width > 0
  }

  draw(context) {
    this.measure(context)
    context.font = `${this.fontSize}px "Microsoft YaHei", sans-serif`
    context.fillStyle = this.color
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)'
    context.lineWidth = 2
    context.strokeText(this.content, this.x, this.y)
    context.fillText(this.content, this.x, this.y)
  }

  isColliding(other) {
    return !(this.x + this.width < other.x || 
             this.x > other.x + other.width || 
             Math.abs(this.y - other.y) > this.fontSize)
  }
}

// 渲染循环
const render = () => {
  if (!ctx.value || !canvasRef.value) return
  
  ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  
  activeDanmakus.value = activeDanmakus.value.filter(danmaku => {
    const isVisible = danmaku.update()
    if (isVisible) {
      danmaku.draw(ctx.value)
    }
    return isVisible
  })

  animationFrame.value = requestAnimationFrame(render)
}

// 添加新弹幕
const addDanmaku = (content, color = '#ffffff') => {
  const newDanmaku = new Danmaku(content, color)
  newDanmaku.measure(ctx.value)
  
  // 检查碰撞并调整位置
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    const hasCollision = activeDanmakus.value.some(d => newDanmaku.isColliding(d))
    if (!hasCollision) break
    
    newDanmaku.y = Math.random() * (canvasRef.value.height - newDanmaku.fontSize) + newDanmaku.fontSize
    attempts++
  }
  
  activeDanmakus.value.push(newDanmaku)
}

// 获取弹幕数据
const fetchDanmakus = async () => {
  try {
    const res = await getBarrageService(props.videoId)
    if (res.data) {
      danmakus.value = res.data.map(item => ({
        ...item,
        played: false
      }))
    }
  } catch (error) {
    console.error('获取弹幕失败:', error)
  }
}

// 监听视频时间更新
watch(() => props.currentTime, (newTime) => {
  if (!props.show) return
  
  const currentTimeInt = Math.floor(newTime)
  danmakus.value.forEach(danmaku => {
    if (!danmaku.played && danmaku.timePoint === currentTimeInt) {
      danmaku.played = true
      addDanmaku(danmaku.content, danmaku.color)
    }
  })
})

// 暴露方法给父组件
defineExpose({
  addDanmaku,
  updateSettings
})

onMounted(async () => {
  initCanvas()
  initSettings()  // 初始化设置
  await fetchDanmakus()
  render()
})

onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.danmaku-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}
</style> 