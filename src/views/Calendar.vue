<template>
  <div class="container">
    <h1>Bangumi 动漫时间表</h1>

    <!-- 数据加载状态 -->
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">{{ error }}</div>

    <!-- 动漫时间表 -->
    <div v-else>
      <div v-for="day in calendar" :key="day.weekday.id" class="day-schedule">
        <h2>{{ day.weekday.cn }}</h2>
        <ul>
          <li v-for="anime in day.items" :key="anime.id" class="anime-item">
            <img :src="anime.images?.large || defaultImage" alt="动漫封面" class="anime-cover" />
            <div class="anime-info">
              <h3>{{ anime.name_cn || anime.name }}</h3>
              <p>播出日期: {{ anime.air_date || "未知" }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "BangumiCalendar",
  data() {
    return {
      calendar: [], // 时间表数据
      loading: true, // 加载状态
      error: null, // 错误信息
      defaultImage: "https://via.placeholder.com/150", // 默认封面图片
    };
  },
  methods: {
    // 获取时间表数据
    async fetchCalendar() {
      try {
        const response = await axios.get("https://api.bgm.tv/calendar");
        this.calendar = response.data; // 保存时间表数据
      } catch (err) {
        console.error("获取时间表失败:", err);
        this.error = "获取时间表失败，请稍后再试。";
      } finally {
        this.loading = false; // 数据加载完成
      }
    },
  },
  mounted() {
    this.fetchCalendar(); // 组件挂载时获取数据
  },
};
</script>

<style scoped>
.container {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 20px auto;
  padding: 10px;
  text-align: center;
}

h1 {
  color: #42b983;
}

.day-schedule {
  margin-bottom: 20px;
}

h2 {
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
}

ul {
  list-style: none;
  padding: 0;
}

.anime-item {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  margin: 10px 0;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.anime-cover {
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: 5px;
  margin-right: 10px;
}

.anime-info {
  text-align: left;
}

.anime-info h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.anime-info p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #666;
}
</style>
