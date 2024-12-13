<template>
  <div class="user-center">
    <!-- 顶部背景和用户信息 -->
    <div class="user-header">
      <div class="header-bg">
        <div class="bg-overlay"></div>
      </div>
      <div class="user-info-card">
        <div class="user-basic">
          <div class="avatar-wrap">
            <el-avatar :size="120" :src="userInfo.userPic || defaultAvatar"/>
            <div class="level-tag">LV6</div>
          </div>
          <div class="user-detail">
            <div class="name-row">
              <h1 class="username">{{ userInfo.nickname }}</h1>
              <el-button size="small" class="edit-btn">
                <el-icon>
                  <Edit/>
                </el-icon>
                编辑资料
              </el-button>
            </div>
            <div class="user-id">UID: {{ userInfo.id }}</div>
            <div class="user-intro">这个人很懒，什么都没有写</div>
          </div>
        </div>
        <div class="user-stats">
          <div class="stat-group">
            <div class="stat-item" v-for="stat in userStats" :key="stat.label">
              <div class="num">{{ stat.num }}</div>
              <div class="label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrap">
      <div class="content-main">
        <!-- 左侧导航 -->
        <div class="side-nav">
          <div class="nav-item"
               v-for="item in navItems"
               :key="item.name"
               :class="{ active: currentNav === item.name }"
               @click="currentNav = item.name">
            <el-icon>
              <component :is="item.icon"></component>
            </el-icon>
            {{ item.label }}
            <span class="count" v-if="item.count">({{ item.count }})</span>
          </div>
        </div>

        <!-- 右侧内容 -->
        <div class="main-content">
          <div class="empty-state" v-if="!hasContent && currentNav === 'videos'">
            <el-empty :description="getEmptyText">
              <template #description>
                <p class="empty-text">{{ getEmptyText }}</p>
              </template>
              <el-button type="primary" @click="drawerVisible = true" v-if="currentNav === 'videos'">
                <el-icon>
                  <VideoCamera/>
                </el-icon>
                立即投稿
              </el-button>
            </el-empty>
          </div>

          <!-- 发布视频按钮 -->
          <div class="button-container" v-if="currentNav === 'videos'">
            <el-button type="primary" @click="drawerVisible = true" class="publish-button">
              <el-icon>
                <VideoCamera/>
              </el-icon>
              发布视频
            </el-button>
          </div>

          <!-- 视频列表展示 -->
          <div class="video-list" v-if="currentNav === 'videos' && hasContent">
            <div v-for="video in videos" :key="video.id" class="video-card">
              <div class="video-cover-wrap">
                <img :src="video.cover" class="video-cover" alt="图片获取失败"/>
              </div>
              <div class="video-info">
                <h3 class="video-title">{{ video.title }}</h3>
                <p class="video-description">{{ video.content }}</p>
                <div class="video-meta">
                  <span class="update-time">发布时间: {{ video.createTime }}</span>
                  <span class="view-count">更新时间: {{ video.updateTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 抽屉弹窗 -->
        <el-drawer
            title="发布视频"
            v-model="drawerVisible"
            direction="rtl"
            size="40%">
          <el-form :model="form" label-width="80px">
            <el-form-item label="标题">
              <el-input v-model="form.title" placeholder="请输入视频标题"></el-input>
            </el-form-item>
            <el-form-item label="封面">
              <el-upload
                  :auto-upload="true"
                  action="/api/upload"
                  list-type="picture-card"
                  :on-preview="handlePictureCardPreview"
                  :on-remove="handleRemove"
                  :before-upload="beforeCoverUpload"
                  :headers="{'Authorization':tokenStore.token}"
                  name="file"
                  :on-success="uploadSuccess"
              >
                <i class="el-icon-plus"></i>
              </el-upload>
              <el-dialog :visible.sync="dialogVisible">
                <img width="100%" v-if="form.cover" :src="form.cover" alt="">
              </el-dialog>
            </el-form-item>
            <el-form-item label="视频介绍">
              <el-input
                  type="textarea"
                  :rows="4"
                  placeholder="请输入视频介绍"
                  v-model="form.content">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm">发布</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-drawer>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, reactive} from 'vue'
import {useRouter} from 'vue-router'
import {
  VideoCamera,
  Collection,
  Star,
  Edit,
  Document,
  ChatDotRound
} from '@element-plus/icons-vue'
import useUserInfoStore from '@/stores/userInfo'
import {ElMessage} from "element-plus";
import {useTokenStore} from "@/stores/token";
import {getUserVideoService, publishVideoService} from "@/api/video";
import {getUserInfoService} from "@/api/user";

const router = useRouter()
const userInfoStore = useUserInfoStore()
const currentNav = ref('videos')
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
// token
const tokenStore = useTokenStore()

const userInfo = computed(() => userInfoStore.info)
const hasContent = computed(() => {
  return videos.value.length > 0;
});

const navItems = [
  {name: 'videos', label: '视频', icon: 'VideoCamera', count: 0},
  {name: 'favorites', label: '收藏', icon: 'Collection', count: 0},
  {name: 'likes', label: '点赞', icon: 'Star', count: 0},
  {name: 'articles', label: '专栏', icon: 'Document', count: 0},
  {name: 'comments', label: '评论', icon: 'ChatDotRound', count: 0}
]

const userStats = [
  {num: 301, label: '关注'},
  {num: 4, label: '粉丝'},
  {num: 1, label: '获赞'},
  {num: 0, label: '播放量'}
]

const getEmptyText = computed(() => {
  const texts = {
    videos: '还没有发布过视频哦',
    favorites: '还没有收藏任何内容',
    likes: '还没有点赞过内容',
    articles: '还没有发布过专栏文章',
    comments: '还没有发表过评论'
  }
  return texts[currentNav.value]
})

const drawerVisible = ref(false)
const form = ref({
  title: '',
  cover: '',
  content: ''
})
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

const openDrawer = () => {
  drawerVisible.value = true
}

const handleRemove = (file, fileList) => {
  console.log(file, fileList)
}

const handlePictureCardPreview = (file) => {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}
//文件上传回调
const uploadSuccess = (result) => {
  form.value.cover = result.data;
}

const beforeCoverUpload = (file) => {
  const isJPGorPNG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPGorPNG) {
    ElMessage.error('上传封面图片只能是 JPG 或 PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传封面图片大小不能超过 2MB!')
  }
  return isJPGorPNG && isLt2M
}

const submitForm = async () => {
  // 提交表单逻辑
  console.log('提交表单:', form)
  await publishVideoService(form.value);
  ElMessage.success('发布成功')
  drawerVisible.value = false
}

//重置表单
const resetForm = () => {
  form.title = ''
  form.cover = ''
  form.description = ''
}

//视频区域数据模型
const videos = ref([
  {
    id: 1,
    title: '视频标题1',
    content: '这是视频1的描述',
    cover: 'https://example.com/video1.jpg'
  },
  {
    id: 2,
    title: '视频标题2',
    content: '这是视频2的描述',
    cover: 'http://sncodwj9m.hn-bkt.clouddn.com/b546e174-33f4-42be-bdd2-e3ac690bdf24.jpg'
  },
  {
    id: 3,
    title: '视频标题3',
    content: '这是视频3的描述',
    cover: 'https://example.com/video3.jpg'
  },
  {
    id: 3,
    title: '视频标题2',
    content: '这是视频2的描述',
    cover: 'https://example.com/video2.jpg'
  },
  {
    id: 4,
    title: '视频标题2',
    content: '这是视频2的描述',
    cover: 'https://example.com/video2.jpg'
  },
  {
    id: 5,
    title: '视频标题2',
    content: '这是视频2的描述',
    cover: 'https://example.com/video2.jpg'
  }
]);
//获取用视频信息
const getUserVideoInfo = async () => {
  let result = await getUserVideoService();
  videos.value = result.data;
}
getUserVideoInfo()
</script>

<style scoped>
.user-center {
  min-height: 100vh;
  background-color: #f1f2f3;
}

.user-header {
  position: relative;
  height: 280px; /* 增加高度 */
  color: #18191c;
  margin-bottom: 20px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(to bottom, #f6f7f8, #fff);
}

.user-info-card {
  position: relative;
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 240px; /* 设置最小高度 */
}

.user-basic {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  margin-bottom: 0;
  position: relative;
  z-index: 2;
  padding-top: 20px;
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
  margin-bottom: 0;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-wrap :deep(.el-avatar) {
  border: 4px solid #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.level-tag {
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff6699;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-detail {
  flex: 1;
  min-width: 0;
  color: #18191c;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.username {
  font-size: 26px;
  font-weight: bold;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  color: #18191c;
}

.edit-btn {
  padding: 8px 16px;
  border-radius: 4px;
  background: #f4f5f7;
  border: 1px solid #e3e5e7;
  color: #61666d;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: #e3e5e7;
}

.user-id {
  font-size: 14px;
  color: #61666d;
  margin-bottom: 8px;
}

.user-intro {
  font-size: 14px;
  color: #61666d;
  max-width: 600px;
  line-height: 1.5;
}

.user-stats {
  border-top: 1px solid #e3e5e7;
  padding-top: 16px;
  position: relative;
  z-index: 2;
  margin-top: 20px;
  margin-bottom: 20px; /* 增加底部间距 */
  text-align: center;
}

.stat-group {
  display: flex;
  gap: 60px;
  justify-content: center;
  padding-bottom: 16px;
}

.stat-item {
  text-align: center;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 1s ease-in-out;
}

.stat-item .num {
  font-size: 22px;
  font-weight: bold;
  color: #18191c;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-item .label {
  font-size: 13px;
  color: #61666d;
  line-height: 1;
}

.content-area {
  background-color: #fff;
  border-radius: 8px;
  margin: 0 auto;
  max-width: 1100px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.nav-tabs {
  background: #fff;
  border-radius: 4px;
  margin-bottom: 20px;
}

.nav-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  border-bottom: 1px solid #e3e5e7;
}

.nav-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #e3e5e7;
}

.nav-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 24px;
  height: 46px;
  line-height: 46px;
  color: #61666d;
}

.nav-tabs :deep(.el-tabs__item.is-active) {
  color: #18191c;
  font-weight: bold;
}

.nav-tabs :deep(.el-tabs__active-bar) {
  background-color: #18191c;
}

.content-wrap {
  background: #fff;
  min-height: calc(100vh - 364px);
}

.content-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  gap: 24px;
}

.side-nav {
  width: 200px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  background: #fff; /* 默认背景色设置为白色 */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /* 添加轻微阴影 */
}

.nav-item:hover {
  background: #f6f7f8; /* 悬停时背景色 */
  color: #fb7299; /* 悬停时文字颜色 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 悬停时阴影 */
}

.nav-item.active {
  background: #fff1f5; /* 激活时背景色 */
  color: #fb7299; /* 激活时文字颜色 */
  font-weight: 500; /* 激活时字体加粗 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 激活时阴影 */
}

.count {
  font-size: 12px;
  color: #999; /* 调整计数颜色以便于阅读 */
  margin-left: 4px;
}


.main-content {
  flex: 1;
  min-height: 400px;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

.empty-img {
  width: 200px;
  margin-bottom: 20px;
}

.empty-text {
  color: #666;
  font-size: 14px;
  margin: 16px 0;
}

:deep(.el-button--primary) {
  background: #fb7299;
  border-color: #fb7299;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-button--primary:hover) {
  background: #fc8bab;
  border-color: #fc8bab;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-header {
    height: 200px;
  }

  .user-info-card {
    padding: 10px 20px;
  }

  .user-basic {
    gap: 16px;
  }

  .username {
    font-size: 20px;
  }

  .user-stats {
    padding-top: 12px;
    margin-top: 15px;
  }

  .stat-group {
    gap: 30px;
  }

  .stat-item .num {
    font-size: 18px;
  }

  .content-wrap {
    min-height: calc(100vh - 300px);
  }

  .content-main {
    padding: 1200px;
  }

  .side-nav {
    width: 150px;
  }

  .nav-item {
    padding: 8px 12px;
  }

  .main-content {
    min-height: 300px;
    padding: 16px;
  }

  .empty-img {
    width: 150px;
  }
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px;
}

.video-card {
  display: flex;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e3e5e7;
  height: 120px; /* 固定高度 */
}

.video-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-cover-wrap {
  width: 200px; /* 固定宽度 */
  height: 120px; /* 固定高度 */
  flex-shrink: 0; /* 防止图片被压缩 */
}

.video-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-info {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.video-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  color: #18191c;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.video-description {
  font-size: 14px;
  color: #61666d;
  margin: 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  max-height: 2.8em;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #9499a0;
}

.update-time, .view-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .video-card {
    height: 100px;
  }

  .video-cover-wrap {
    width: 160px;
    height: 100px;
  }

  .video-info {
    padding: 8px 12px;
  }

  .video-title {
    font-size: 14px;
  }

  .video-description {
    font-size: 12px;
    margin: 4px 0;
    line-height: 1.3;
    max-height: 2.6em;
  }
}

.button-container {
  display: flex;
  justify-content: flex-end; /* 右对齐 */
  margin-bottom: 20px; /* 添加底部间距 */
}
</style>
