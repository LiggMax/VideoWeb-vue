<template>
  <div class="anime-manage">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="showAddAnimeDialog">
        <el-icon><Plus /></el-icon>
        创建新番剧
      </el-button>
    </div>

    <!-- 番剧列表页面 -->
    <div v-if="!currentAnimeId" class="anime-list-page">
      <div class="anime-grid">
        <div 
          v-for="anime in animeList" 
          :key="anime.id" 
          class="anime-card"
          @click="handleAnimeClick(anime.animeId)"
        >
          <div class="cover-wrapper">
            <el-image 
              :src="anime.coverImage" 
              fit="cover" 
              class="cover-image"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="cover-overlay">
              <span class="episode-count">{{ anime.episodes?.length || 0 }}集</span>
            </div>
          </div>
          <div class="anime-info">
            <h3 class="title">{{ anime.title }}</h3>
            <div class="meta">
              <el-tag :type="getStatusType(anime.status)" size="small">
                {{ getStatusLabel(anime.status) }}
              </el-tag>
              <span class="release-date">{{ anime.releaseDate }} : 首播</span>
            </div>
            <p class="description">{{ anime.description || '暂无简介' }}</p>
          </div>
        </div>
      </div>

      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pageParams.pageNum"
          v-model:page-size="pageParams.pageSize"
          :page-sizes="[12, 24, 36, 48]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 剧集管理页面 -->
    <div v-else class="episode-manager-page">
      <div class="page-header">
        <el-button @click="backToList">
          <el-icon><Back /></el-icon>返回列表
        </el-button>
      </div>
      <anime-episode-manager 
        :anime-id="currentAnimeId" 
        @update="handleEpisodeUpdate"
      />
    </div>

    <!-- 新增/编辑番剧对话框 -->
    <el-dialog
      v-model="animeDialogVisible"
      :title="isEdit ? '编辑番剧' : '新增番剧'"
      width="50%"
    >
      <el-form :model="animeForm" label-width="80px">
        <el-form-item label="封面">
          <el-upload
              :show-file-list="false"
              class="cover-uploader"
              :auto-upload="true"
              action="/api/file/uploadImage"
              :headers="{'Authorization': tokenStore.token}"
              name="image"
              :on-success="uploadSuccess"
              accept="image/*"
          >
            <img v-if="animeForm.coverImage" :src="animeForm.coverImage" class="uploaded-cover" alt=""/>
            <el-icon v-else class="upload-icon">
              <Plus/>
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="animeForm.title" placeholder="请输入番剧标题"/>
        </el-form-item>
        <el-form-item label="简介">
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
              :disabled-date="disabledDate"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="animeForm.status">
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
          <el-button type="primary" @click="submitAnimeForm">
            {{ isEdit ? '修改' : '确定' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {
  Plus,
  Picture,
  Back
} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {useTokenStore} from "@/stores/token"
import {
  addAnimeService,
  getAnimeListService,
  updateAnimeService,
  deleteAnimeService,
  addEpisodeService,
  uploadVideoService
} from "@/api/anime/anime"
import AnimeEpisodeManager from './anime/AnimeEpisodeManager.vue'
import { useRouter } from 'vue-router'

const animeList = ref([])
const animeDialogVisible = ref(false)
const episodeDialogVisible = ref(false)
const isEdit = ref(false)
const currentAnimeId = ref(null)
const tokenStore = useTokenStore()
const total = ref(0)
const pageParams = ref({
  pageNum: 1,
  pageSize: 10
})

const router = useRouter()

// 番剧状态选项
const statusOptions = [
  {label: '连载中', value: 'ongoing'},
  {label: '已完结', value: 'completed'},
  {label: '即将上映',value: 'upcoming'},
  {label: '暂停', value: 'hiatus'}
]

const animeForm = ref({
  title: '',
  coverImage: '',
  description: '',
  releaseDate: '',
  status: 'ongoing'
})

const episodeForm = ref({
  number: 1,
  title: '',
  videoUrl: '',
  videoName: ''
})

//封面回调函数
const uploadSuccess = (response) => {
  animeForm.value.coverImage = response.data
}
// 获取番剧列表
const getAnimeList = async () => {
  try {
    const res = await getAnimeListService({
      ...pageParams.value,
      // 可以添加其他查询参数
    })
    animeList.value = res.data.items
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('获取番剧列表失败')
  }
}

// 上传视频
const uploadVideo = async (options) => {
  try {
    const formData = new FormData()
    formData.append('video', options.file)
    const res = await uploadVideoService(formData)
    episodeForm.value.videoUrl = res.data
    episodeForm.value.videoName = options.file.name
    ElMessage.success('视频上传成功')
  } catch (error) {
    ElMessage.error('上传视频失败')
  }
}

// 移除视频
const removeVideo = () => {
  episodeForm.value.videoUrl = ''
  episodeForm.value.videoName = ''
}

// 显示添加番剧对话框
const showAddAnimeDialog = () => {
  isEdit.value = false
  animeForm.value = {
    title: '',
    coverImage: '',
    description: '',
    releaseDate: '',
    status: 'ongoing'
  }
  animeDialogVisible.value = true
}

// 处理编辑番剧
const handleEdit = (row) => {
  isEdit.value = true
  currentAnimeId.value = row.animeId
  animeForm.value = {
    title: row.title || '',
    coverImage: row.coverImage || '',
    description: row.description || '',
    releaseDate: row.releaseDate || '',
    status: row.status || 'ongoing'
  }
  animeDialogVisible.value = true
}

// 处理删除番剧
const handleDelete = async (row) => {
  try {
    await deleteAnimeService(row.animeId)
    await getAnimeList()
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 处理添加剧集
const handleAddEpisode = (row) => {
  currentAnimeId.value = row.id
  episodeForm.value = {
    number: (row.episodes?.length || 0) + 1,
    title: '',
    videoUrl: '',
    videoName: ''
  }
  episodeDialogVisible.value = true
}

// 提交新增番剧表单
const submitAnimeForm = async () => {
  try {
    // 表单验证
    if (!animeForm.value.title?.trim()) {
      ElMessage.warning('请输入番剧标题')
      return
    }
    if (!animeForm.value.coverImage) {
      ElMessage.warning('请上传番剧封面')
      return
    }

    if (isEdit.value) {
      // 调用修改函数
      await handleEditAnime()
    } else {
      // 调用新增函数
      await handleAddAnime()
    }
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
  }
}

// 处理新增番剧
const handleAddAnime = async () => {
  const addData = {
    title: animeForm.value.title.trim(),
    coverImage: animeForm.value.coverImage,
    description: animeForm.value.description?.trim() || '',
    releaseDate: animeForm.value.releaseDate || null,
    status: animeForm.value.status || 'ongoing'
  }
  await addAnimeService(addData)
  pageParams.value.pageNum = 1 // 重置到第一页
  await getAnimeList()
  animeDialogVisible.value = false
  ElMessage.success('添加成功')
}

// 处理修改番剧
const handleEditAnime = async () => {
  await updateAnimeService(currentAnimeId.value, animeForm.value)
  
  // 刷新列表
  await getAnimeList()
  animeDialogVisible.value = false
  ElMessage.success('修改成功')
}

// 提交剧集表单
const submitEpisodeForm = async () => {
  try {
    await addEpisodeService(currentAnimeId.value, {
      ...episodeForm.value,
      animeId: currentAnimeId.value
    })
    await getAnimeList()
    episodeDialogVisible.value = false
    ElMessage.success('添加剧集成功')
  } catch (error) {
    ElMessage.error('添加剧集失败')
  }
}

// 获取状态对应的标签类型
const getStatusType = (status) => {
  const types = {
    'ongoing': 'success',
    'upcoming': 'warning',
    'finished': 'info'
  }
  return types[status] || 'info'
}

// 获取状态对应的显示文本
const getStatusLabel = (status) => {
  const labels = {
    'ongoing': '连载中',
    'hiatus': '停止',
    'upcoming': '即将上映',
    'completed': '已完结'
  }
  return labels[status] || '未知'
}

// 禁用未来日期
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

// 处理每页数量变化
const handleSizeChange = (val) => {
  pageParams.value.pageSize = val
  pageParams.value.pageNum = 1 // 重置到第一页
  getAnimeList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  pageParams.value.pageNum = val
  getAnimeList()
}

// 处理下拉菜单命令
const handleCommand = async (command, row) => {
  switch (command) {
    case 'edit':
      handleEdit(row)
      break
    case 'delete':
      try {
        await ElMessageBox.confirm('确定要删除这部番剧吗？', '警告', {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        await handleDelete(row)
      } catch {}
      break
  }
}

const emit = defineEmits(['select-anime'])

const handleAnimeClick = (animeId) => {
  emit('select-anime', animeId)
}

onMounted(() => {
  getAnimeList()
})
</script>

<style scoped lang="scss">
.anime-manage {
  padding: 20px;
}

.action-bar {
  margin-bottom: 24px;
}

.anime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.anime-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .cover-image {
      transform: scale(1.05);
    }
  }
}

.cover-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; // 16:9 比例
  overflow: hidden;
}

.cover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: #fff;
}

.anime-info {
  padding: 16px;
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: #18191c;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.release-date {
  font-size: 13px;
  color: #909399;
}

.description {
  font-size: 13px;
  color: #61666d;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #909399;
  font-size: 24px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.episode-manager-page {
  .page-header {
    margin-bottom: 20px;
  }
}

/* 封面上传样式 */
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

.anime-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.anime-card:hover {
  transform: translateY(-5px);
}
</style> 