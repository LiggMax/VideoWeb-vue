<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
  >
    <path
      d="M17.982 9.275 8.06 3.27A2.013 2.013 0 0 0 5 4.994v12.011a2.017 2.017 0 0 0 3.06 1.725l9.922-6.005a2.017 2.017 0 0 0 0-3.45z"
      fill="currentColor"
    />
  </svg>
</template>

<script setup>
defineProps({
  color: {
    type: String,
    default: '#db639b'
  }
})
</script>

<style scoped>
.icon {
  width: 1em;
  height: 1em;
}
</style> 