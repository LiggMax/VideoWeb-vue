<template>
  <div class="danmaku-color-picker">
    <el-tooltip
      content="选择弹幕颜色"
      effect="dark"
    >
      <button 
        class="color-btn"
        @click="showPicker = !showPicker"
      >
        <ColorIcon class="color-icon" />
        <span 
          class="color-dot"
          :style="{ backgroundColor: modelValue }"
        ></span>
      </button>
    </el-tooltip>

    <!-- 颜色选择面板 -->
    <div class="color-panel" v-show="showPicker" @click.stop>
      <div class="color-list">
        <button
          v-for="color in colors"
          :key="color"
          class="color-item"
          :style="{ backgroundColor: color }"
          :class="{ active: modelValue === color }"
          @click="selectColor(color)"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ColorIcon from '@/components/icons/ColorIcon.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '#FFFFFF'
  }
})

const emit = defineEmits(['update:modelValue'])

const showPicker = ref(false)

// 预定义的颜色列表
const colors = [
  '#FFFFFF', // 白色
  '#FF7204', // 橙色
  '#FFD302', // 黄色
  '#A0EE00', // 绿色
  '#00CD00', // 深绿
  '#19D2FF', // 青色
  '#66CCFF', // 蓝色
  '#ff2ea2', // 粉色
  '#FF0000', // 红色
]

const selectColor = (color) => {
  emit('update:modelValue', color)
  showPicker.value = false
}

// 点击外部关闭面板
const closePanel = (e) => {
  if (!e.target.closest('.danmaku-color-picker')) {
    showPicker.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closePanel)
})

onUnmounted(() => {
  document.removeEventListener('click', closePanel)
})
</script>

<style lang="scss" scoped>
.danmaku-color-picker {
  position: relative;
}

.color-btn {
  width: 42px;
  height: 42px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  position: relative;

  .color-icon {
    width: 30px;
    height: 30px;
    color: #fff;
    opacity: 0.8;
    transition: all 0.3s;
  }

  .color-dot {
    position: absolute;
    right: 6px;
    bottom: 6px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
  }

  &:hover {
    .color-icon {
      opacity: 1;
      transform: scale(1.1);
      color: #fb7299;
    }
    
    .color-dot {
      transform: scale(1.2);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.4);
    }
  }
}

.color-panel {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  background: rgba(28, 28, 28, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.color-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.color-item {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);

  &:hover {
    transform: scale(1.1);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
  }

  &.active {
    box-shadow: inset 0 0 0 2px #fff;
    transform: scale(1.1);
  }
}
</style> 