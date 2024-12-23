<template>
  <el-tooltip
    :content="modelValue ? '关闭弹幕' : '开启弹幕'"
    placement="top"
    effect="dark"
  >
    <button 
      class="control-btn danmaku-toggle" 
      @click="toggleDanmaku"
      :class="{ 'is-active': !modelValue }"
    >
      <DanmakuOffIcon v-if="modelValue" />
      <DanmakuDisabledIcon v-else />
    </button>
  </el-tooltip>
</template>

<script setup>
import DanmakuOffIcon from '@/components/icons/DanmakuOffIcon.vue'
import DanmakuDisabledIcon from '@/components/icons/DanmakuDisabledIcon.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const toggleDanmaku = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>

<style lang="scss" scoped>
.danmaku-toggle {
  width: 36px;
  height: 36px;
  padding: 6px;
  border-radius: 4px;
  
  svg {
    width: 24px;
    height: 24px;
    transition: all 0.3s;
  }
  
  &.is-active {
    color: #00AEEC;
  }
  
  &:hover {
    svg {
      transform: scale(1.1);
      color: #00AEEC;
    }
  }
}
</style> 