<template>
  <div class="anime-manage">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="showAddAnimeDialog">
        <el-icon>
          <Plus/>
        </el-icon>
        发布新番剧
      </el-button>
    </div>

    <!-- 番剧列表 -->
    <div class="anime-list">
      <el-table 
        :data="animeList" 
        style="width: 100%"
        :header-cell-style="{
          background: '#f8f9fa',
          color: '#606266',
          fontWeight: 500
        }"
      >
        <el-table-column prop="coverImage" label="封面" width="180">
          <template #default="scope">
            <div class="cover-wrapper">
              <el-image
                :src="scope.row.coverImage"
                :preview-src-list="[scope.row.coverImage]"
                fit="cover"
                class="anime-cover"
              />
              <div class="cover-overlay">
                <span class="episode-count">{{ scope.row.episodes?.length || 0 }}集</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="scope">
            <div class="anime-info">
              <div class="title">{{ scope.row.title }}</div>
              <div class="description">{{ scope.row.description || '暂无简介' }}</div>
              <div class="meta-info">
                <span class="release-date">首播: {{ formatDate(scope.row.releaseDate) || '未设置' }}</span>
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusLabel(scope.row.status) }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <div class="action-group">
              <el-tooltip 
                content="添加剧集" 
                placement="top" 
                :show-after="500"
              >
                <div class="action-item" @click="handleAddEpisode(scope.row)">
                  <el-icon><VideoCamera /></el-icon>
                </div>
              </el-tooltip>
              <el-tooltip 
                content="编辑信息" 
                placement="top"
                :show-after="500"
              >
                <div class="action-item" @click="handleEdit(scope.row)">
                  <el-icon><Edit /></el-icon>
                </div>
              </el-tooltip>
              <el-popconfirm
                title="确定要删除这部番剧吗？"
                confirm-button-text="确定"
                cancel-button-text="取消"
                @confirm="handleDelete(scope.row)"
              >
                <template #reference>
                  <el-tooltip 
                    content="删除番剧" 
                    placement="top"
                    :show-after="500"
                  >
                    <div class="action-item delete">
                      <el-icon><Delete /></el-icon>
                    </div>
                  </el-tooltip>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pageParams.pageNum"
          v-model:page-size="pageParams.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
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
            <img v-if="animeForm.coverImage" :src="animeForm.coverImage" class="uploaded-cover"/>
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
          <el-button type="primary" @click="submitAnimeForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加剧集对话框 -->
    <el-dialog
        v-model="episodeDialogVisible"
        title="添加剧集"
        width="50%"
    >
      <el-form :model="episodeForm" label-width="80px">
        <el-form-item label="集数">
          <el-input-number v-model="episodeForm.number" :min="1"/>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="episodeForm.title" placeholder="请输入剧集标题"/>
        </el-form-item>
        <el-form-item label="视频">
          <el-upload
              class="video-uploader"
              :http-request="uploadVideo"
              :show-file-list="false"
              accept="video/*"
          >
            <el-button type="primary" v-if="!episodeForm.videoUrl">
              <el-icon>
                <Upload/>
              </el-icon>
              上传视频
            </el-button>
            <div v-else class="video-preview">
              <el-icon class="success-icon">
                <CircleCheckFilled/>
              </el-icon>
              <span class="video-name">{{ episodeForm.videoName }}</span>
              <el-button link type="danger" @click.stop="removeVideo">
                删除
              </el-button>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="episodeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEpisodeForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {
  Plus, 
  Upload, 
  CircleCheckFilled, 
  VideoCamera,
  Edit,
  Delete
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
import {formatCount, formatDate} from "@/utils/format";

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

// 番剧状态选项
const statusOptions = [
  {label: '连载中', value: 'ongoing'},
  {label: '已完结', value: 'completed'},
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
  currentAnimeId.value = row.id
  animeForm.value = {...row}
  animeDialogVisible.value = true
}

// 处理删除番剧
const handleDelete = async (row) => {
  try {
    await deleteAnimeService(row.id)
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
    if (isEdit.value) {
      await updateAnimeService(currentAnimeId.value, animeForm.value)
    } else {
      await addAnimeService(animeForm.value)
    }
    pageParams.value.pageNum = 1 // 重置到第一页
    await getAnimeList()
    animeDialogVisible.value = false
    ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
  }
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
    ongoing: 'success',
    completed: 'info',
    hiatus: 'warning'
  }
  return types[status] || 'info'
}

// 获取状态对应的显示文本
const getStatusLabel = (status) => {
  const statusMap = {
    ongoing: '连载中',
    completed: '已完结',
    hiatus: '暂停'
  }
  return statusMap[status] || status
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

onMounted(() => {
  getAnimeList()
})
</script>

<style scoped>
.anime-manage {
  width: 100%;
}

.action-bar {
  margin-bottom: 20px;
}

.cover-wrapper {
  position: relative;
  width: 120px;
  height: 160px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.anime-cover {
  width: 120px;
  height: 160px;
  transition: transform 0.3s;
}

.cover-wrapper:hover .anime-cover {
  transform: scale(1.05);
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
}

.episode-count {
  color: #fff;
  font-size: 12px;
  font-weight: 500;
}

.anime-info {
  padding: 8px 0;
}

.anime-info .title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.anime-info .description {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.release-date {
  font-size: 13px;
  color: #909399;
}

.action-group {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.action-item {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #606266;
  background-color: #f4f4f5;

  .el-icon {
    font-size: 16px;
  }

  &:hover {
    background-color: #e6f7ff;
    color: #1890ff;
    transform: translateY(-1px);
  }

  &.delete {
    &:hover {
      background-color: #fff1f0;
      color: #ff4d4f;
    }
  }
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

:deep(.el-table__row) {
  transition: background-color 0.3s;
}

:deep(.el-table__row:hover) {
  background-color: #f8f9fa;
}

:deep(.el-button--primary.is-plain) {
  &:hover {
    color: #fff;
    background-color: var(--el-button-hover-bg-color);
  }
}

.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.cover-uploader:hover {
  border-color: #409eff;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.uploaded-cover {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.video-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.success-icon {
  color: #67c23a;
  font-size: 16px;
}

.video-name {
  color: #606266;
  font-size: 14px;
}

/* 添加状态标签样式 */
:deep(.el-tag) {
  min-width: 60px;
  text-align: center;
}

:deep(.el-tag--success) {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}

:deep(.el-tag--warning) {
  background-color: #fdf6ec;
  border-color: #faecd8;
  color: #e6a23c;
}

:deep(.el-tag--info) {
  background-color: #f4f4f5;
  border-color: #e9e9eb;
  color: #909399;
}

/* 日期选择器样式 */
:deep(.el-date-picker) {
  --el-datepicker-border-color: #dcdfe6;
  --el-datepicker-hover-border-color: #c0c4cc;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-datepicker-border-color) inset;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--el-datepicker-hover-border-color) inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #fb7299 inset;
}

/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

/* 分页组件样式定制 */
:deep(.el-pagination.is-background) {
  .el-pagination__total,
  .el-pagination__sizes {
    margin-right: 16px;
  }

  .btn-prev,
  .btn-next,
  .el-pager li {
    background-color: #fff;
    border: 1px solid #dcdfe6;
    
    &:hover {
      color: #fb7299;
    }
  }

  .el-pager li.is-active {
    background-color: #fb7299;
    border-color: #fb7299;
    color: #fff;
    
    &:hover {
      color: #fff;
    }
  }
}

:deep(.el-pagination__sizes .el-select .el-input) {
  width: 110px;
}

@media screen and (max-width: 768px) {
  .pagination-container {
    justify-content: center;
  }

  :deep(.el-pagination) {
    .el-pagination__total,
    .el-pagination__sizes {
      display: none;
    }
  }
}
</style> 