<template>
  <div class="app">
    <Header />
    <router-view></router-view>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Calendar from "@/views/Calendar.vue";
</script>

<style>
.app {
  min-height: 100vh;
  background-color: #f6f7f8;
  padding-top: 64px;
}

html {
  scroll-behavior: smooth;
}
</style> 