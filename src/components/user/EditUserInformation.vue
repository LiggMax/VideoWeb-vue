<template>
  <div class="edit-profile-content">

    <el-divider content-position="left">个人资料</el-divider>

    <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="100px"
        class="edit-form"
    >
      <!-- 头像上传 -->
      <el-form-item label="头像" prop="userPic">
        <el-upload
            class="avatar-uploader"
            action="/api/file/uploadImage"
            :headers="{'Authorization': tokenStore.token}"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            name="image"
        >
          <img v-if="form.userPic" :src="form.userPic" class="avatar-preview" alt="头像加载失败"/>
          <el-icon v-else class="avatar-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
      </el-form-item>

      <!-- 昵称 -->
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" placeholder="请输入昵称"/>
      </el-form-item>

      <!-- 性别 -->
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="form.sex">
          <el-radio :label="1">男</el-radio>
          <el-radio :label="2">女</el-radio>
          <el-radio :label="0">保密</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="邮箱">
        <div class="info-value readonly">{{ userInfo.email }}</div>
      </el-form-item>

      <!-- 个人简介 -->
      <el-form-item label="个人简介" prop="introduction">
        <el-input
            v-model="form.introduction"
            type="textarea"
            :rows="4"
            placeholder="介绍一下你自己吧"
        />
      </el-form-item>
      <el-form-item label="注册时间:">
        <div class="info-value readonly">{{ formatDate(userInfo.createTime) }}</div>
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="submitForm(formRef)">保存修改</el-button>
        <el-button @click="resetForm(formRef)">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import {ElMessage} from 'element-plus'
import {Plus} from '@element-plus/icons-vue'
import {useTokenStore} from '@/stores/token'
import useUserInfoStore from '@/stores/userInfo'
import {updateUserInfoService} from '@/api/user/user'

const tokenStore = useTokenStore()
const userInfoStore = useUserInfoStore()
const formRef = ref(null)

// 表单数据
const form = ref({
  nickname: '',
  userPic: '',
  sex: 0,
  introduction: ''
})

// 表单验证规则
const rules = {
  nickname: [
    {required: true, message: '请输入昵称', trigger: 'blur'},
    {min: 2, max: 12, message: '昵称长度在 2 到 12 个字符', trigger: 'blur'}
  ],
  introduction: [
    {required: true, message: '请输入个人简介', trigger: 'blur'},
    {min: 5, max: 100, message: '简介长度在 5 到 100 个字符', trigger: 'blur'}
  ]
}

// 头像上传成功回调
const handleAvatarSuccess = (response) => {
  form.value.userPic = response.data
  ElMessage.success('头像上传成功')
}

// 头像上传前的验证
const beforeAvatarUpload = (image) => {
  const isJPGOrPNG = ['image/jpeg', 'image/png'].includes(image.type)
  const isLt2M = image.size / 1024 / 1024 < 10

  if (!isJPGOrPNG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 10MB!')
    return false
  }
  return true
}

// 提交表单
const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      await updateUserInfoService(form.value)
      ElMessage.success('个人资料更新成功')
      // 更新 store 中的用户信息
      await userInfoStore.info()
    }
  })
}

// 重置表单
const resetForm = (formEl) => {
  if (!formEl) return
  formEl.resetFields()
  initForm()
}

// 初始化表单数据
const initForm = () => {
  const userInfo = userInfoStore.info
  form.value = {
    nickname: userInfo.nickname || '',
    userPic: userInfo.userPic || '',
    sex: userInfo.sex || 0,
    introduction: userInfo.introduction || ''
  }
}

// 组件挂载时初始化表单数据
onMounted(() => {
  initForm()
})

// 获取用户信息
const userInfo = computed(() => userInfoStore.info)

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.edit-profile-content {
  padding: 32px 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  max-width: 1000px;
  margin: 0 auto;
}

.info-section {
  margin-bottom: 32px;
}

:deep(.el-divider__text) {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  padding: 0 24px;
}

:deep(.el-form-item.is-required:not(.is-no-asterisk)) {
  margin-top: 20px;
}

.info-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  line-height: 32px;
}

.info-value.readonly {
  text-align: right;
  padding-right: 20px;
  color: #606266;
}

.edit-form {
  max-width: 800px;
  margin: 24px auto 0;
  padding: 0 20px;
}

.avatar-uploader {
  text-align: center;
}

.avatar-uploader :deep(.el-upload) {
  border: 2px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
  width: 140px;
  height: 140px;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: #fb7299;
}

.avatar-uploader-icon {
  font-size: 32px;
  width: 140px;
  height: 140px;
  line-height: 140px;
}

.avatar-preview {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
}

:deep(.el-button--primary) {
  background-color: #fb7299;
  border-color: #fb7299;
}

:deep(.el-button--primary:hover) {
  background-color: #fc8bab;
  border-color: #fc8bab;
}

:deep(.el-form-item) {
  margin-bottom: 32px;
}

:deep(.el-form-item__label) {
  font-size: 15px;
  padding-right: 24px;
}

:deep(.el-input__inner) {
  height: 40px;
  line-height: 40px;
  font-size: 15px;
}

:deep(.el-textarea__inner) {
  font-size: 15px;
  padding: 12px 16px;
  min-height: 120px;
}

:deep(.el-button) {
  padding: 12px 24px;
  font-size: 15px;
  height: 44px;
}

.info-value.readonly {
  font-size: 15px;
  padding: 8px 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  min-height: 40px;
  line-height: 24px;
  display: flex;
  align-items: center;
}

/* 响应式设计优化 */
@media (max-width: 1200px) {
  .edit-profile-content {
    max-width: 900px;
    padding: 24px 32px;
  }
  
  .edit-form {
    max-width: 700px;
  }
}

@media (max-width: 768px) {
  .edit-profile-content {
    padding: 20px;
    margin: 0 16px;
  }
  
  .edit-form {
    padding: 0;
  }
  
  :deep(.el-form-item__label) {
    padding-right: 16px;
  }
}
</style> 