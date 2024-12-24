<template>
  <el-popover
    placement="top"
    :width="320"
    trigger="click"
    :offset="12"
    popper-class="danmaku-settings-popover"
  >
    <template #reference>
      <div class="danmaku-settings-trigger">
        <el-icon><Setting /></el-icon>
        <span>弹幕设置</span>
      </div>
    </template>
    
    <div class="danmaku-settings">
      <div class="settings-header">
        <el-icon><Setting /></el-icon>
        <h4>弹幕设置</h4>
      </div>
      <div class="setting-item">
        <span>不透明度</span>
        <el-slider 
          v-model="opacity" 
          :min="0.1" 
          :max="1" 
          :step="0.1"
          :format-tooltip="(val) => Math.round(val * 100) + '%'"
          @change="updateSettings"
          class="custom-slider"
        />
      </div>
      <div class="setting-item">
        <span>弹幕大小</span>
        <el-select v-model="size" size="small" @change="updateSettings">
          <el-option label="小" value="small" />
          <el-option label="中" value="medium" />
          <el-option label="大" value="large" />
        </el-select>
      </div>
      <div class="setting-item">
        <span>弹幕速度</span>
        <el-select v-model="speed" size="small" @change="updateSettings">
          <el-option label="慢" value="slow" />
          <el-option label="中" value="normal" />
          <el-option label="快" value="fast" />
        </el-select>
      </div>
      <div class="setting-item">
        <span>显示区域</span>
        <div class="area-selector">
          <div 
            v-for="area in areas" 
            :key="area.value"
            class="area-option"
            :class="{ active: selectedArea === area.value }"
            @click="selectArea(area.value)"
            :data-height="area.height"
          >
            <div class="area-preview">
              <div class="video-mock"></div>
              <div class="danmaku-area" :class="area.value"></div>
            </div>
            <span>{{ area.label }}</span>
          </div>
        </div>
      </div>
      <div class="settings-footer">
        <el-button size="small" @click="resetSettings">恢复默认设置</el-button>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Setting } from '@element-plus/icons-vue'

const emit = defineEmits(['update'])

const defaultSettings = {
  opacity: 0.8,
  size: 'medium',
  speed: 'normal',
  area: 'h50'
}

const getSavedSettings = () => {
  const saved = localStorage.getItem('danmaku_settings')
  return saved ? JSON.parse(saved) : defaultSettings
}

const saveSettings = (settings) => {
  localStorage.setItem('danmaku_settings', JSON.stringify(settings))
}

const savedSettings = getSavedSettings()
const opacity = ref(savedSettings.opacity)
const size = ref(savedSettings.size)
const speed = ref(savedSettings.speed)
const selectedArea = ref(savedSettings.area)

const areas = [
  { label: '1/5屏', value: 'h20'},
  { label: '半屏', value: 'h50'},
  { label: '全屏', value: 'h100'}
]

const selectArea = (area) => {
  selectedArea.value = area
  updateSettings()
}

const updateSettings = () => {
  const newSettings = {
    opacity: opacity.value,
    size: size.value,
    speed: speed.value,
    area: selectedArea.value
  }

  saveSettings(newSettings)

  emit('update', {
    opacity: opacity.value,
    fontSize: {
      small: 18,
      medium: 24,
      large: 30
    }[size.value],
    speed: {
      slow: 1,
      normal: 2,
      fast: 3
    }[speed.value],
    area: selectedArea.value
  })
}

const resetSettings = () => {
  opacity.value = defaultSettings.opacity
  size.value = defaultSettings.size
  speed.value = defaultSettings.speed
  selectedArea.value = defaultSettings.area

  saveSettings(defaultSettings)

  updateSettings()
}

onMounted(() => {
  updateSettings()
})
</script>

<style lang="scss" scoped>
.danmaku-settings-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
  padding: 4px;
  border-radius: 2px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  .el-icon {
    font-size: 16px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }
  
  span {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
    opacity: 0.9;
  }
}

:deep(.danmaku-settings-popover) {
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: none;
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.98);
}

.danmaku-settings {
  padding: 16px;
  
  .settings-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);

    .el-icon {
      font-size: 18px;
      color: #fb7299;
      filter: drop-shadow(0 1px 2px rgba(251, 114, 153, 0.2));
    }

    h4 {
      margin: 0;
      font-size: 16px;
      color: #18191c;
      font-weight: 500;
      text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
    }
  }
  
  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    
    span {
      color: #18191c;
      font-size: 14px;
    }
    
    .el-slider {
      width: 180px;
    }
    
    .el-select {
      width: 100px;
    }
  }

  :deep(.custom-slider) {
    .el-slider__runway {
      height: 4px;
    }
    
    .el-slider__bar {
      background-color: #fb7299;
      height: 4px;
    }
    
    .el-slider__button {
      width: 14px;
      height: 14px;
      border: 2px solid #fb7299;
      background-color: #fff;
      
      &:hover {
        transform: scale(1.2);
      }
    }
  }

  :deep(.el-select) {
    .el-input__wrapper {
      border-radius: 4px;
      
      &.is-focus {
        box-shadow: 0 0 0 1px #fb7299;
      }
    }
  }

  .settings-footer {
    margin-top: 20px;
    padding-top: 12px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    text-align: center;

    .el-button {
      width: 100%;
      color: rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(0, 0, 0, 0.1);
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(4px);
      transition: all 0.3s;
      
      &:hover {
        color: #fb7299;
        border-color: #fb7299;
        background: rgba(255, 255, 255, 0.95);
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(251, 114, 153, 0.1);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
  }

  .area-selector {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 8px;
    width: 100%;

    .area-option {
      cursor: pointer;
      text-align: center;
      transition: all 0.3s;
      
      &:hover .area-preview {
        border-color: #fb7299;
      }
      
      &.active {
        .area-preview {
          border-color: #fb7299;
          box-shadow: 0 0 0 2px rgba(251, 114, 153, 0.2);
        }
        
        span {
          color: #fb7299;
        }
      }

      .area-preview {
        width: 100%;
        aspect-ratio: 16/9;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        margin-bottom: 4px;
        position: relative;
        overflow: hidden;
        transition: all 0.3s;

        .video-mock {
          position: absolute;
          inset: 0;
          background: #f5f7fa;
        }

        .danmaku-area {
          position: absolute;
          background: rgba(251, 114, 153, 0.1);
          border: 1px dashed rgba(251, 114, 153, 0.3);
          left: 0;
          right: 0;
          top: 0;
          
          &.h20 {
            height: 20%;
          }
          
          &.h50 {
            height: 50%;
          }
          
          &.h100 {
            height: 100%;
          }
        }
      }

      span {
        font-size: 12px;
        color: #606266;
        transition: color 0.3s;
        display: block;
        margin-top: 4px;
      }
      
      &::after {
         content: attr(data-height);
         font-size: 11px;
         color: #909399;
         display: block;
         margin-top: 2px;
      }
    }
  }
}
</style> 