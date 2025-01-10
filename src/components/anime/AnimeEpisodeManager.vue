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
        <el-image 
          :src="animeInfo.coverImage" 
          fit="cover" 
          class="cover-image"
          :preview-src-list="[animeInfo.coverImage]"
        >
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
      <el-table 
        :data="animeInfo.episodes" 
        style="width: 100%" 
        row-key="episodeId"
        v-loading="loading"
        :empty-text="loading ? '加载中...' : '暂无剧集'"
      >
        <el-table-column label="集数" width="80" align="center">
          <template #default="scope">
            <span class="episode-number">第{{ scope.row.number }}集</span>
          </template>
        </el-table-column>
        
        <el-table-column label="标题" min-width="200">
          <template #default="scope">
            <div class="episode-title">{{ scope.row.episodeTitle }}</div>
          </template>
        </el-table-column>
        
        <el-table-column label="时长" width="100" align="center">
          <template #default="scope">
            <span>{{ scope.row.duration }}分钟</span>
          </template>
        </el-table-column>
        
        <el-table-column label="上传时间" width="180">
          <template #default="scope">
            <span>{{ formatDate(scope.row.airDate) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                class="action-btn"
                type="primary" 
                link
                @click="previewEpisode(scope.row)"
              >
                <el-icon><VideoPlay /></el-icon>
              </el-button>
              <el-button 
                class="action-btn"
                type="primary" 
                link
                @click="editEpisode(scope.row)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button 
                class="action-btn"
                type="danger" 
                link
                @click="deleteEpisode(scope.row)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
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
              <el-button link type="danger" >删除</el-button>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="episodeDialogVisible = false">取消</el-button>
          <el-button type="primary"  :loading="uploading">
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Upload, 
  CircleCheckFilled, 
  Picture, 
  Back, 
  VideoPlay, 
  Edit, 
  Delete 
} from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'
import VideoPlayer from '@/components/video/VideoPlayer.vue'
import { getAnimeDetailService } from '@/api/anime/animeEpisode'

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
const loading = ref(true)

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
  loading.value = true
  try {
    const res = await getAnimeDetailService(props.animeId)
    if (res.code === 0) {
      const { data } = res
      animeInfo.value = {
        animeId: data.animeId,
        title: data.title,
        coverImage: data.coverImage,
        description: data.description,
        status: data.status || 'completed',
        releaseDate: data.releaseDate,
        episodes: data.episodes?.map(episode => ({
          episodeId: episode.episodeId,
          number: episode.episodeNumber,
          episodeTitle: episode.episodeTitle,
          duration: episode.duration,
          videoUrl: episode.episodeVideo || '',
          episodeImage: episode.episodeImage,
          airDate: episode.airDate
        })) || []
      }
      console.log('处理后的数据:', animeInfo.value)
    }
  } catch (error) {
    console.error('获取番剧信息失败:', error)
    ElMessage.error('获取番剧信息失败')
  } finally {
    loading.value = false
  }
}

// 添加 watch 以监听 animeId 的变化
watch(() => props.animeId, (newId) => {
  if (newId) {
    getAnimeDetail()
  }
}, { immediate: true })

// 格式化时长


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
    episodeId: episode.episodeId,
    number: episode.number,
    title: episode.episodeTitle,
    videoUrl: episode.videoUrl,
    videoName: `第${episode.number}集`,
    episodeImage: episode.episodeImage
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
    // TODO: 调用删除接口
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
    const formData = new FormData()
    formData.append('video', options.file)
    // TODO: 调用上传接口
    const res = await uploadVideoService(formData)
    episodeForm.value.videoUrl = res.data
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

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  padding: 6px;
  border-radius: 4px;
  transition: all 0.3s;
}

.action-btn:hover {
  background-color: #f5f7fa;
}

.action-btn :deep(.el-icon) {
  font-size: 16px;
  vertical-align: middle;
}

/* 为不同类型的按钮设置悬停颜色 */
.action-btn[type="primary"]:hover {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.action-btn[type="danger"]:hover {
  color: var(--el-color-danger);
  background-color: var(--el-color-danger-light-9);
}
</style> 