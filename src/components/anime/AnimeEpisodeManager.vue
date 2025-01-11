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
      <div class="edit-button">
        <el-button type="primary" @click="showEditAnimeDialog">
          <el-icon><Edit /></el-icon>编辑信息
        </el-button>
      </div>
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
          <span class="release-date">首播: {{ animeInfo.releaseDate }}</span>
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
            <span class="episode-number">第{{ scope.row.episodeNumber }}集</span>
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
          <el-select
            v-model="episodeForm.number" 
            placeholder="请选择集数"
            style="width: 100%"
            filterable
            :filter-method="filterEpisodeNumber"
          >
            <el-option
              v-for="num in availableEpisodeNumbers"
              :key="num"
              :label="`第${num}集`"
              :value="num"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input 
            v-model="episodeForm.title" 
            placeholder="请输入剧集标题"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="封面" prop="episodeImage">
          <el-upload
            class="episode-cover-uploader"
            :show-file-list="false"
            :auto-upload="true"
            action="/api/file/uploadImage"
            name="image"
            :on-success="handleEpisodeCoverSuccess"
            accept="image/*"
          >
            <img 
              v-if="episodeForm.episodeImage" 
              :src="episodeForm.episodeImage" 
              class="episode-cover-preview"
            />
            <div v-else class="episode-cover-placeholder">
              <el-icon><Plus /></el-icon>
              <div class="upload-text">点击上传封面</div>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="视频" prop="videoUrl">
          <div class="video-upload-container">
            <!-- 选择文件区域 -->
            <div v-if="!selectedFile && !episodeForm.videoUrl" class="upload-area" @click="triggerFileSelect">
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">选择视频文件</div>
              <div class="upload-tip">支持 MP4、WebM 格式，最大 500MB</div>
            </div>
            
            <!-- 已选择文件展示 -->
            <div v-else-if="selectedFile && !uploading" class="file-selected">
              <div class="file-info">
                <el-icon><Document /></el-icon>
                <span class="file-name">{{ selectedFile.name }}</span>
                <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
              </div>
              <div class="file-actions">
                <el-button 
                  type="primary" 
                  link 
                  @click="uploadVideo"
                  :disabled="uploading"
                >
                  <el-icon><Upload /></el-icon>
                  上传
                </el-button>
                <el-button 
                  type="danger" 
                  link 
                  @click="removeSelectedFile"
                  :disabled="uploading"
                >
                  <el-icon><Delete /></el-icon>
                  移除
                </el-button>
              </div>
            </div>
            
            <!-- 上传进度展示 -->
            <div v-if="uploading" class="upload-progress">
              <el-progress 
                :percentage="uploadProgress" 
                :format="progressFormat"
                status="success"
              />
              <div class="progress-info">
                <span>{{ formatFileSize(uploadedSize) }} / {{ formatFileSize(selectedFile?.size || 0) }}</span>
                <span>{{ uploadSpeed }} MB/s</span>
              </div>
            </div>
            
            <!-- 隐藏的文件输入框 -->
            <input
              type="file"
              ref="fileInput"
              accept="video/*"
              style="display: none"
              @change="handleFileSelect"
            >
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="episodeDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="submitEpisodeForm" 
            :disabled="!episodeForm.videoUrl || uploading"
          >
            确定
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

    <!-- 编辑番剧信息对话框 -->
    <el-dialog
      v-model="animeDialogVisible"
      title="编辑番剧信息"
      width="50%"
    >
      <el-form :model="animeForm" label-width="80px" ref="animeFormRef">
        <el-form-item label="封面">
          <el-upload
            class="cover-uploader"
            :show-file-list="false"
            :auto-upload="true"
            action="/api/file/uploadImage"
            name="image"
            :on-success="handleCoverSuccess"
            accept="image/*"
          >
            <img v-if="animeForm.coverImage" :src="animeForm.coverImage" class="uploaded-cover"/>
            <el-icon v-else class="upload-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="animeForm.title" placeholder="请输入番剧标题"/>
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input
            v-model="animeForm.description"
            type="textarea"
            rows="4"
            placeholder="请输入番剧简介"
          />
        </el-form-item>
        <el-form-item label="首播时间">
          <el-date-picker
            v-model="animeForm.releaseDate"
            type="date"
            placeholder="选择首播日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="animeForm.status" style="width: 100%">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="animeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAnimeForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
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
  Delete,
  Document
} from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'
import VideoPlayer from '@/components/video/VideoPlayer.vue'
import { getAnimeDetailService } from '@/api/anime/animeEpisode'
import {uploadVideoService} from "@/api/anime/anime";
import { updateAnimeService } from '@/api/anime/anime'
import { addAnimeEpisodeService } from '@/api/anime/animeEpisode'

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
  episodeNumber: 1,
  title: '',
  videoUrl: '',
  videoName: '',
  episodeImage: ''
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
  ],
  episodeImage: [
    { required: true, message: '请上传剧集封面', trigger: 'change' }
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
      const { data } = res
      animeInfo.value = {
        ...data,
        status: data.status || 'completed',
        episodes: data.episodes || []
      }
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

// 计算可用的集数选项
const availableEpisodeNumbers = computed(() => {
  const existingNumbers = new Set(animeInfo.value.episodes?.map(ep => ep.episodeNumber))
  const maxNumber = Math.max(...Array.from(existingNumbers), 0) + 1
  const numbers = []
  
  // 如果是编辑模式，包含当前编辑的集数
  if (isEdit.value) {
    existingNumbers.delete(episodeForm.value.number)
  }
  
  // 生成集数列表，包括所有缺失的集数和下一集
  for (let i = 1; i <= maxNumber; i++) {
    if (!existingNumbers.has(i)) {
      numbers.push(i)
    }
  }
  
  return numbers.sort((a, b) => a - b)
})

// 集数筛选方法
const filterEpisodeNumber = (value) => {
  const query = value.toString().toLowerCase()
  return availableEpisodeNumbers.value.filter(num => {
    return `第${num}集`.toLowerCase().includes(query)
  })
}

// 显示添加剧集对话框
const showAddEpisodeDialog = () => {
  isEdit.value = false
  episodeForm.value = {
    number: availableEpisodeNumbers.value[0] || 1,
    title: '',
    videoUrl: '',
    videoName: ''
  }
  episodeDialogVisible.value = true
}

// 文件相关状态
const fileInput = ref(null)
const selectedFile = ref(null)
const uploadProgress = ref(0)
const uploadedSize = ref(0)
const uploadSpeed = ref(0)
let uploadStartTime = 0

// 触发文件选择
const triggerFileSelect = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 500 * 1024 * 1024) { // 500MB限制
      ElMessage.error('文件大小不能超过500MB')
      return
    }
    selectedFile.value = file
  }
  event.target.value = '' // 重置input，允许选择相同文件
}

// 移除已选择的文件
const removeSelectedFile = () => {
  selectedFile.value = null
  episodeForm.value.videoUrl = ''
  episodeForm.value.videoName = ''
  uploadProgress.value = 0
  uploadedSize.value = 0
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化进度条文字
const progressFormat = (percentage) => {
  return percentage === 100 ? '上传完成' : `${percentage}%`
}

// 修改上传视频方法
const uploadVideo = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择视频文件')
    return
  }

  try {
    uploading.value = true
    uploadStartTime = Date.now()
    
    const formData = new FormData()
    formData.append('video', selectedFile.value)

    const config = {
      onUploadProgress: (progressEvent) => {
        const complete = progressEvent.loaded / progressEvent.total
        uploadProgress.value = parseFloat((complete * 100).toFixed(2))
        uploadedSize.value = progressEvent.loaded
        
        // 计算上传速度
        const duration = (Date.now() - uploadStartTime) / 1000
        const speedMBps = (progressEvent.loaded / (1024 * 1024)) / duration
        uploadSpeed.value = speedMBps.toFixed(2)
      }
    }

    const res = await uploadVideoService(formData, config)
    episodeForm.value.videoUrl = res.data
    episodeForm.value.videoName = selectedFile.value.name
    ElMessage.success('视频上传成功')
  } catch (error) {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

// 状态选项
const statusOptions = [
  { label: '连载中', value: 'ongoing' },
  { label: '已完结', value: 'completed' },
  { label: '暂停', value: 'hiatus' }
]

// 编辑番剧表单
const animeDialogVisible = ref(false)
const animeFormRef = ref(null)
const animeForm = ref({
  title: '',
  coverImage: '',
  description: '',
  releaseDate: '',
  status: ''
})

// 显示编辑番剧对话框
const showEditAnimeDialog = () => {
  animeForm.value = {
    title: animeInfo.value.title,
    coverImage: animeInfo.value.coverImage,
    description: animeInfo.value.description,
    releaseDate: animeInfo.value.releaseDate,
    status: animeInfo.value.status
  }
  animeDialogVisible.value = true
}

// 处理封面上传成功
const handleCoverSuccess = (res) => {
  animeForm.value.coverImage = res.data
}

// 提交番剧表单
const submitAnimeForm = async () => {
  try {
    await updateAnimeService(props.animeId, animeForm.value)
    ElMessage.success('更新成功')
    animeDialogVisible.value = false
    await getAnimeDetail()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

// 提交剧集
const submitEpisodeForm = async () => {
  try {
    // 表单验证
    await episodeFormRef.value.validate()
    
    // 构造提交的数据
    const episodeData = {
      episodeNumber: episodeForm.value.number,
      episodeTitle: episodeForm.value.title,
      episodeVideo: episodeForm.value.videoUrl,
      episodeImage: episodeForm.value.episodeImage,
      animeId: props.animeId
    }

    // 调用添加剧集接口
    await addAnimeEpisodeService(props.animeId, episodeData)

    // 成功提示
    ElMessage.success('添加剧集成功')

    // 关闭对话框
    episodeDialogVisible.value = false

    // 重新获取番剧详情，刷新列表
    await getAnimeDetail()

    // 重置表单
    episodeForm.value = {
      number: availableEpisodeNumbers.value[0] || 1,
      title: '',
      videoUrl: '',
      videoName: '',
      episodeImage: ''
    }
    selectedFile.value = null
    uploadProgress.value = 0
    uploadedSize.value = 0
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('添加剧集失败')
    }
  }
}

// 处理封面上传成功
const handleEpisodeCoverSuccess = (res) => {
  episodeForm.value.episodeImage = res.data
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
  position: relative;
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

.edit-button {
  position: absolute;
  top: 20px;
  right: 20px;
}

.cover-uploader {
  :deep(.el-upload) {
    width: 200px;
    height: 280px;
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: #fb7299;
    }
  }
}

.uploaded-cover {
  width: 200px;
  height: 280px;
  object-fit: cover;
  display: block;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
}

.video-upload-container {
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  padding: 20px;
}

.upload-area {
  cursor: pointer;
  text-align: center;
  padding: 30px 0;
  transition: all 0.3s;
}

.upload-area:hover {
  background-color: #f5f7fa;
  border-color: #409eff;
}

.file-selected {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name {
  font-size: 14px;
  color: #606266;
}

.file-size {
  color: #909399;
  font-size: 12px;
}

.upload-progress {
  padding: 16px 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-actions .el-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.episode-cover-uploader {
  :deep(.el-upload) {
    width: 280px;
    height: 158px;
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s;

    &:hover {
      border-color: #fb7299;
    }
  }
}

.episode-cover-preview {
  width: 280px;
  height: 158px;
  object-fit: cover;
  display: block;
}

.episode-cover-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;

  .el-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }

  .upload-text {
    font-size: 14px;
  }
}
</style> 