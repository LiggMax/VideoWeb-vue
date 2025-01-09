<template>
  <div class="episode-manager">
    <!-- 返回按钮 -->
    <div class="page-header">
      <el-button @click="backToList">
        <el-icon><Back /></el-icon>返回列表
      </el-button>
    </div>

    <!-- 番剧基本信息卡片 -->
    <div class="anime-info-card">
      <div class="cover-section">
        <el-image :src="animeInfo.coverImage" fit="cover" class="cover-image">
          <template #error>
            <div class="image-placeholder">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
      </div>
      <div class="info-section">
        <h2 class="title">{{ animeInfo.title }}</h2>
        <div class="meta-info">
          <el-tag :type="getStatusTagType(animeInfo.status)" size="small">
            {{ getStatusLabel(animeInfo.status) }}
          </el-tag>
          <span class="release-date">首播: {{ formatDate(animeInfo.releaseDate) }}</span>
          <span class="episode-count">总集数: {{ animeInfo.episodes?.length || 0 }}</span>
        </div>
        <p class="description">{{ animeInfo.description || '暂无简介' }}</p>
      </div>
    </div>

    <!-- 剧集管理区域 -->
    <div class="episodes-section">
      <div class="section-header">
        <h3>剧集列表</h3>
        <el-button type="primary" @click="showAddEpisodeDialog">
          <el-icon><Plus /></el-icon>添加剧集
        </el-button>
      </div>

      <!-- 剧集列表 -->
      <el-table :data="animeInfo.episodes" style="width: 100%" row-key="number">
        <el-table-column label="集数" width="80" align="center">
          <template #default="scope">
            <span class="episode-number">第{{ scope.row.number }}集</span>
          </template>
        </el-table-column>
        
        <el-table-column label="标题" min-width="200">
          <template #default="scope">
            <div class="episode-title">{{ scope.row.episodeTitle || scope.row.title }}</div>
          </template>
        </el-table-column>
        
        <el-table-column label="时长" width="100" align="center">
          <template #default="scope">
            <span>{{ formatDuration(scope.row.duration) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="上传时间" width="180">
          <template #default="scope">
            <span>{{ formatDate(scope.row.airDate || scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="previewEpisode(scope.row)">预览</el-button>
            <el-button link type="primary" @click="editEpisode(scope.row)">编辑</el-button>
            <el-button link type="danger" @click="deleteEpisode(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑剧集对话框 -->
    <el-dialog
      v-model="episodeDialogVisible"
      :title="isEdit ? '编辑剧集' : '添加剧集'"
      width="50%"
    >
      <el-form :model="episodeForm" label-width="80px" :rules="episodeRules" ref="episodeFormRef">
        <el-form-item label="集数" prop="number">
          <el-input-number 
            v-model="episodeForm.number" 
            :min="1"
            controls-position="right"
            placeholder="请输入集数"
          />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input 
            v-model="episodeForm.title" 
            placeholder="请输入剧集标题"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="视频" prop="videoUrl">
          <el-upload
            class="video-uploader"
            :http-request="uploadVideo"
            :show-file-list="false"
            accept="video/*"
            :before-upload="beforeVideoUpload"
          >
            <div v-if="!episodeForm.videoUrl" class="upload-area">
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">点击上传视频</div>
              <div class="upload-tip">支持 MP4、WebM 格式</div>
            </div>
            <div v-else class="video-preview">
              <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
              <div class="video-info">
                <div class="video-name">{{ episodeForm.videoName }}</div>
              </div>
              <el-button link type="danger" @click.stop="removeVideo">删除</el-button>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="episodeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEpisodeForm" :loading="uploading">
            {{ uploading ? '上传中...' : '确定' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 视频预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="视频预览"
      width="70%"
      :destroy-on-close="true"
    >
      <video-player
        v-if="previewUrl"
        :video-url="previewUrl"
        :auto-play="true"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, CircleCheckFilled, Picture, Back } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'
import VideoPlayer from '@/components/video/VideoPlayer.vue'
import { getAnimeDetailService } from '@/api/anime/anime'
import { getAnimeEpisodeService } from '@/api/anime/animeEpisode'

// 添加状态处理函数
const getStatusTagType = (status) => {
  const types = {
    'ongoing': 'success',
    'completed': 'info',
    'hiatus': 'warning'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status) => {
  const labels = {
    'ongoing': '连载中',
    'completed': '已完结',
    'hiatus': '暂停'
  }
  return labels[status] || '未知'
}

const router = useRouter()

// 番剧信息
const animeInfo = ref({
  title: '',
  coverImage: '',
  description: '',
  status: '',
  releaseDate: '',
  episodes: []
})
const episodeDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const previewUrl = ref('')
const isEdit = ref(false)
const uploading = ref(false)

// 表单相关
const episodeFormRef = ref(null)
const episodeForm = ref({
  number: 1,
  title: '',
  videoUrl: '',
  videoName: ''
})

// 表单校验规则
const episodeRules = {
  number: [
    { required: true, message: '请输入集数', trigger: 'blur' },
    { type: 'number', min: 1, message: '集数必须大于0', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入剧集标题', trigger: 'blur' },
    { min: 1, max: 50, message: '标题长度在1-50个字符之间', trigger: 'blur' }
  ],
  videoUrl: [
    { required: true, message: '请上传视频', trigger: 'change' }
  ]
}

// 在 props 中添加 animeId
const props = defineProps({
  animeId: {
    type: [String, Number],
    required: true
  }
})

// 获取番剧详情
const getAnimeDetail = async () => {
  const res = await getAnimeDetailService(props.animeId)
  if (res.code === 0) {
    const animeData = res.data[0]
    if (animeData) {
      animeInfo.value = {
        animeId: animeData.animeId,
        title: animeData.title,
        coverImage: animeData.coverImage,
        description: animeData.description,
        status: animeData.status,
        releaseDate: animeData.releaseDate,
        episodes: []
      }
      // 获取剧集信息
      getEpisodes()
    }
  }
}

// 获取剧集列表
const getEpisodes = async () => {
  const res = await getAnimeEpisodeService(props.animeId)
  if (res.code === 0) {
    animeInfo.value.episodes = res.data.map(episode => ({
      episodeId: episode.episodeId,
      number: episode.episodeNumber,
      title: episode.episodeTitle,
      duration: episode.duration,
      videoUrl: episode.episodeImage,
      createTime: episode.airDate,
      updateTime: episode.airDate
    }))
  }
}

// 添加 watch 以监听 animeId 的变化
watch(() => props.animeId, (newId) => {
  if (newId) {
    getAnimeDetail()
  }
}, { immediate: true })

// 格式化时长
const formatDuration = (minutes) => {
  if (!minutes) return '未知'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours ? `${hours}小时${mins}分钟` : `${mins}分钟`
}

// 返回列表
const emit = defineEmits(['update'])

const backToList = () => {
  emit('update')
}

// 预览剧集
const previewEpisode = (episode) => {
  previewUrl.value = episode.videoUrl
  previewDialogVisible.value = true
}

// 编辑剧集
const editEpisode = (episode) => {
  isEdit.value = true
  episodeForm.value = {
    number: episode.number,
    title: episode.title,
    videoUrl: episode.videoUrl,
    videoName: `第${episode.number}集`
  }
  episodeDialogVisible.value = true
}

// 删除剧集
const deleteEpisode = async (episode) => {
  try {
    await ElMessageBox.confirm('确定要删除这个剧集吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    // 这里添加删除逻辑
    ElMessage.success('删除成功')
    await getAnimeDetail()
  } catch (error) {
    console.log('取消删除')
  }
}

// 显示添加剧集对话框
const showAddEpisodeDialog = () => {
  isEdit.value = false
  episodeForm.value = {
    number: (animeInfo.value.episodes?.length || 0) + 1,
    title: '',
    videoUrl: '',
    videoName: ''
  }
  episodeDialogVisible.value = true
}

// 上传视频
const uploadVideo = async (options) => {
  try {
    uploading.value = true
    // 模拟上传延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    episodeForm.value.videoUrl = 'https://example.com/uploaded-video.mp4'
    episodeForm.value.videoName = options.file.name
    ElMessage.success('视频上传成功')
  } catch (error) {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

// 移除视频
const removeVideo = () => {
  episodeForm.value.videoUrl = ''
  episodeForm.value.videoName = ''
}

// 提交表单
const submitEpisodeForm = async () => {
  if (!episodeFormRef.value) return
  
  try {
    await episodeFormRef.value.validate()
    
    if (isEdit.value) {
      // 编辑逻辑
      await updateEpisodeService(props.animeId, episodeForm.value)
      ElMessage.success('更新成功')
    } else {
      // 添加逻辑
      await addEpisodeService(props.animeId, episodeForm.value)
      ElMessage.success('添加成功')
    }
    
    episodeDialogVisible.value = false
    await getAnimeDetail()
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失败')
  }
}

// 视频上传前验证
const beforeVideoUpload = (file) => {
  const isMP4 = file.type === 'video/mp4'
  const isLt500M = file.size / 1024 / 1024 < 500

  if (!isMP4) {
    ElMessage.error('请上传 MP4 格式的视频!')
  }
  if (!isLt500M) {
    ElMessage.error('视频大小不能超过 500MB!')
  }
  return isMP4 && isLt500M
}
</script>

<style scoped>
.episode-manager {
  padding: 20px;
}

.anime-info-card {
  display: flex;
  gap: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.cover-section {
  flex-shrink: 0;
}

.cover-image {
  width: 200px;
  height: 280px;
  border-radius: 8px;
  overflow: hidden;
}

.info-section {
  flex: 1;
}

.title {
  font-size: 24px;
  font-weight: 500;
  color: #18191c;
  margin-bottom: 16px;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.description {
  font-size: 14px;
  color: #61666d;
  line-height: 1.6;
}

.episodes-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.episode-number {
  font-weight: 500;
}

.upload-area {
  text-align: center;
  padding: 24px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #409eff;
}

.page-header {
  margin-bottom: 20px;
}

/* 其他样式保持不变... */
</style> 