<template>
  <div class="emoji-picker-popup" v-show="visible" :style="position">
    <div class="emoji-container">
      <div class="emoji-grid">
        <div v-for="(emoji, index) in emojis" 
          :key="index" 
          class="emoji-item"
          @click="selectEmoji(emoji)"
        >
          {{ emoji }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: Boolean,
  position: Object
})

const emit = defineEmits(['select', 'close'])

// 表情列表
const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'
]

const selectEmoji = (emoji) => {
  emit('select', emoji)
}
</script>

<style scoped>
.emoji-picker-popup {
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 12px;
  z-index: 2000;
  top: 100%;
  left: 0;
  margin-top: 8px;
}

.emoji-picker-popup::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 20px;
  border-style: solid;
  border-width: 0 8px 8px 8px;
  border-color: transparent transparent white transparent;
}

.emoji-container {
  width: 320px;
  max-height: 300px;
  overflow-y: auto;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 8px;
}

.emoji-item {
  font-size: 24px;
  cursor: pointer;
  text-align: center;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.emoji-item:hover {
  background-color: #f5f5f5;
  transform: scale(1.2);
}

/* 自定义滚动条样式 */
.emoji-container::-webkit-scrollbar {
  width: 6px;
}

.emoji-container::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
}

.emoji-container::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}
</style> 