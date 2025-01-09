<template>
  <div class="video-content">
    <!-- 空状态 -->
    <div class="empty-state" v-if="!hasContent">
      <el-empty :description="emptyText">
        <template #description>
          <p class="empty-text">{{ emptyText }}</p>
        </template>
        <el-button type="primary" @click="drawerVisible = true">
          <el-icon><VideoCamera /></el-icon>
          立即投稿
        </el-button>
      </el-empty>
    </div>

    <!-- 发布视频按钮 -->
    <div class="button-container">
      <el-button type="primary" @click="drawerVisible = true" class="publish-button">
        <el-icon><VideoCamera /></el-icon>
        发布视频
      </el-button>
    </div>

    <!-- 视频列表展示 -->
    <div class="video-list" v-if="hasContent">
      <div v-for="video in videos" :key="video.id" class="video-card">
        <div class="video-cover-wrap">
          <img :src="video.cover" class="video-cover" alt="图片获取失败"/>
        </div>
        <div class="video-info">
          <div class="video-actions">
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="action-icon">
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{ type: 'edit', id: video.id }">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ type: 'delete', id: video.id }">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <h3 class="video-title">{{ video.title }}</h3>
          <p class="video-description">{{ video.content }}</p>
          <div class="video-meta">
            <span class="update-time">发布时间: {{ video.createTime }}</span>
            <span class="view-count">更新时间: {{ video.updateTime }}</span>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          background
        />
      </div>
    </div>

    <!-- 抽屉弹窗 -->
    <el-drawer
      :title="isEdit ? '编辑视频' : '发布视频'"
      v-model="drawerVisible"
      direction="rtl"
      size="40%"
      @close="handleDrawerClose"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="请输入视频标题"></el-input>
        </el-form-item>

        <!-- 封面上传 -->
        <el-form-item label="封面">
          <el-upload
            class="cover-uploader"
            list-type="picture-card"
            :show-file-list="false"
            :auto-upload="true"
            action="/api/file/uploadImage"
            name="image"
            :headers="{'Authorization': tokenStore.token}"
            :on-success="uploadSuccess"
          >
            <img v-if="form.cover" :src="form.cover" class="cover-preview"/>
            <el-icon v-else><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <!-- 视频文件上传 -->
        <el-form-item label="视频文件">
          <el-upload
            class="video-uploader"
            :auto-upload="true"
            action="/api/file/uploadVideo"
            :on-success="handleVideoSuccess"
            :before-upload="beforeVideoUpload"
            :headers="{'Authorization': tokenStore.token}"
            name="video"
            :limit="1"
            :on-exceed="handleVideoExceed"
            accept=".mp4,.mov,.avi,.mkv"
          >
            <div class="video-upload-box">
              <template v-if="!form.videoUrl">
                <el-icon class="upload-icon"><VideoCamera /></el-icon>
                <div class="upload-text">点击上传视频</div>
                <div class="upload-tip">支持 mp4/mov/avi 格式，</div>
              </template>
              <template v-else>
                <div class="video-preview">
                  <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
                  <span class="file-name">{{ videoFileName }}</span>
                  <el-button 
                    type="danger" 
                    size="small" 
                    class="remove-btn"
                    @click.stop="removeVideo"
                  >
                    移除
                  </el-button>
                </div>
              </template>
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="视频介绍">
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入视频介绍"
            v-model="form.content"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="isEdit ? updateVideo() : submitForm()">
            {{ isEdit ? '修改' : '发布' }}
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  VideoCamera, 
  Edit, 
  Delete, 
  MoreFilled, 
  Plus, 
  CircleCheckFilled 
} from '@element-plus/icons-vue'
import { useTokenStore } from '@/stores/token'
import { 
  deleteVideoService, 
  editVideoService, 
  getUserVideoService, 
  publishVideoService 
} from '@/api/userVideo'

const tokenStore = useTokenStore()
const emptyText = '还没有发布过视频哦'

// 视频列表数据
const videos = ref([])
const hasContent = computed(() => videos.value.length > 0)

// 分页相关
const pagination = ref({
  pageNum: 1,
  pageSize: 5,
  total: 0
})

// 表单数据
const drawerVisible = ref(false)
const form = ref({
  title: '',
  cover: '',
  content: '',
  videoUrl: ''
})
const isEdit = ref(false)
const currentEditId = ref(null)
const videoFileName = ref('')

// 获取用户视频列表
const getUserVideoInfo = async () => {
  const result = await getUserVideoService({
    pageNum: pagination.value.pageNum,
    pageSize: pagination.value.pageSize
  })
  videos.value = result.data.items
  pagination.value.total = result.data.total
}

// 分页处理
const handlePageChange = (newPage) => {
  pagination.value.pageNum = newPage
  getUserVideoInfo()
}

const handleSizeChange = (newSize) => {
  pagination.value.pageSize = newSize
  pagination.value.pageNum = 1
  getUserVideoInfo()
}

// 视频操作处理
const handleCommand = async ({ type, id }) => {
  if (type === 'edit') {
    const currentVideo = videos.value.find(video => video.id === id)
    if (currentVideo) {
      form.value = {
        title: currentVideo.title,
        cover: currentVideo.cover,
        content: currentVideo.content,
        videoUrl: currentVideo.videoUrl
      }
      isEdit.value = true
      currentEditId.value = id
      drawerVisible.value = true
    }
  } else if (type === 'delete') {
    try {
      await ElMessageBox.confirm('确定要删除这个视频吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      await deleteVideoService(id)
      await getUserVideoInfo()
      ElMessage.success('删除成功')
    } catch (error) {
      console.log('取消删除')
    }
  }
}

// 表单处理
const submitForm = async () => {
  await publishVideoService(form.value)
  ElMessage.success('发布成功')
  drawerVisible.value = false
  await getUserVideoInfo()
  resetForm()
}

const updateVideo = async () => {
  await editVideoService({
    id: currentEditId.value,
    ...form.value
  })
  ElMessage.success('更新成功')
  drawerVisible.value = false
  await getUserVideoInfo()
  resetForm()
}

const resetForm = () => {
  form.value = {
    title: '',
    cover: '',
    content: '',
    videoUrl: ''
  }
  videoFileName.value = ''
  isEdit.value = false
  currentEditId.value = null
}

// 上传处理
const uploadSuccess = (result) => {
  form.value.cover = result.data
}

const handleVideoSuccess = (response) => {
  form.value.videoUrl = response.data
  videoFileName.value = response.originalFilename || '已上传视频'
}

const beforeVideoUpload = (file) => {
  const isLt500M = file.size / 1024 / 1024 < 1500

  if (!isLt500M) {
    ElMessage.error('视频大小不能超过 1.5G!')
    return false
  }
  return true
}

const handleVideoExceed = () => {
  ElMessage.warning('只能上传一个视频文件')
}

const removeVideo = () => {
  form.value.videoUrl = ''
  videoFileName.value = ''
}

const handleDrawerClose = () => {
  resetForm()
  drawerVisible.value = false
}

// 初始化
getUserVideoInfo()
</script>

<style scoped>
.video-content {
  width: 100%;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
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
  height: 120px;
}

.video-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-cover-wrap {
  width: 200px;
  height: 120px;
  flex-shrink: 0;
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
  position: relative;
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

.video-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.action-icon {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #666;
  transition: all 0.3s;
}

.action-icon:hover {
  background-color: #f5f5f5;
  color: #fb7299;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 10px 0;
}

/* 上传相关样式 */
.cover-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.cover-uploader :deep(.el-upload:hover) {
  border-color: #fb7299;
}

.cover-preview {
  width: 178px;
  height: 178px;
  object-fit: cover;
  display: block;
}

.video-upload-box {
  width: 100%;
  height: 150px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}

.video-upload-box:hover {
  border-color: #fb7299;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

.video-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
}

.success-icon {
  color: #67c23a;
  font-size: 20px;
}

.file-name {
  color: #606266;
  font-size: 14px;
}

.remove-btn {
  margin-left: auto;
}

/* Element Plus 主题覆盖 */
:deep(.el-button--primary) {
  background-color: #fb7299;
  border-color: #fb7299;
}

:deep(.el-button--primary:hover) {
  background-color: #fc8bab;
  border-color: #fc8bab;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #fb7299;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled):hover) {
  color: #fb7299;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.empty-text {
  color: #666;
  font-size: 14px;
  margin: 16px 0;
}

/* 响应式设计 */
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
</style> 