<template>
    <el-dialog
      v-model="dialogVisible"
      width="800px"
      :show-close="false"
      class="login-dialog"
    >
      <div class="dialog-header">
        <div class="header-content">
          <div class="tabs">
            <span 
              :class="['tab-item', currentView === 'login' ? 'active' : '']"
              @click="switchView('login')"
            >
              登录
            </span>
            <span 
              :class="['tab-item', currentView === 'register' ? 'active' : '']"
              @click="switchView('register')"
            >
              注册
            </span>
          </div>
          <div class="close-btn" @click="closeDialog">
            <el-icon><Close /></el-icon>
          </div>
        </div>
      </div>
  
      <div class="dialog-content">
        <!-- 左侧图片 -->
        <div class="left-section">
          <img src="https://lain.bgm.tv/r/400/pic/cover/l/ba/69/277954_s8qHA.jpg" alt="login-banner" />
        </div>
  
        <!-- 右侧登录表单 -->
        <div class="right-section">
          <!-- 密码登录表单 -->
          <div v-if="currentView === 'login'" class="login-form">
            <el-form :model="loginForm">
              <el-form-item>
                <el-input 
                  v-model="loginForm.username" 
                  placeholder="请输入账号"
                  :prefix-icon="User"
                  size="large"
                />
              </el-form-item>
              <el-form-item>
                <el-input 
                  v-model="loginForm.password" 
                  type="password" 
                  placeholder="请输入密码"
                  :prefix-icon="Lock"
                  size="large"
                />
              </el-form-item>
              <div class="form-options">
                <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
                <span class="forget-pwd">忘记密码？</span>
              </div>
              <!--登录按钮-->
              <el-button type="primary" class="submit-btn" @click="handleLogin">
                登录
              </el-button>
            </el-form>
  
            <!-- 其他登录方式（仅在登录视图显示） -->
            <div class="other-login">
              <div class="divider">
                <span>其他登录方式</span>
              </div>
              <div class="login-icons">
                <el-icon class="icon"><Position /></el-icon>
                <el-icon class="icon"><ChatDotRound /></el-icon>
                <el-icon class="icon"><Apple /></el-icon>
              </div>
            </div>
  
            <!-- 注册提示（仅在登录视图显示） -->
            <div class="register-tip">
              首次使用？
              <span class="register-link" @click="switchView('register')">点击注册</span>
            </div>
          </div>
  
          <!-- 注册表单 -->
          <div v-if="currentView === 'register'" class="register-form">
            <el-form 
              :model="registerForm"
              :rules="registerRules"
              ref="registerFormRef"
            >
              <el-form-item prop="username">
                <el-input 
                  v-model="registerForm.username" 
                  placeholder="请输入账号"
                  :prefix-icon="User"
                  size="large"
                />
              </el-form-item>
              <el-form-item prop="password">
                <el-input 
                  v-model="registerForm.password" 
                  type="password" 
                  placeholder="请输入密码"
                  :prefix-icon="Lock"
                  size="large"
                />
              </el-form-item>
              <el-form-item prop="confirmPassword">
                <el-input 
                  v-model="registerForm.confirmPassword" 
                  type="password" 
                  placeholder="请确认密码"
                  :prefix-icon="Lock"
                  size="large"
                />
              </el-form-item>
              <el-button type="primary" class="submit-btn" @click="handleRegister">
                注册
              </el-button>
            </el-form>
  
            <!-- 登录提示 -->
            <div class="login-tip">
              已有账号？
              <span class="login-link" @click="switchView('login')">点击登录</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import { 
    Close, 
    Position, 
    ChatDotRound, 
    Apple,
    User,
    Lock,
    Iphone,
    Message
  } from '@element-plus/icons-vue'
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits(['update:visible'])
  const dialogVisible = ref(props.visible)
  const currentView = ref('login')
  const countdown = ref(0)
  
  // 登录表单数据
  const loginForm = ref({
    username: '',
    password: '',
    remember: false
  })
  
  // 短信登录表单数据
  const smsForm = ref({
    phone: '',
    code: ''
  })
  
  // 注册表单数据
  const registerForm = ref({
    username: '',
    password: '',
    confirmPassword: ''
  })
  
  // 注册表单验证规则
  const registerRules = {
    username: [
      { required: true, message: '请输入账号', trigger: 'blur' },
      { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请确认密码', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value !== registerForm.value.password) {
            callback(new Error('两次输入密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }
  
  const registerFormRef = ref(null)
  
  watch(() => props.visible, (newVal) => {
    dialogVisible.value = newVal
  })
  
  watch(dialogVisible, (newVal) => {
    emit('update:visible', newVal)
  })
  
  // 切换视图
  const switchView = (view) => {
    currentView.value = view
    if (view === 'register') {
      registerForm.value = {
        username: '',
        password: '',
        confirmPassword: ''
      }
    }
  }
  
  // 关闭对话框
  const closeDialog = () => {
    dialogVisible.value = false
    currentView.value = 'login'
  }
  
  // 处理密码登录
  const handleLogin = () => {
    console.log('密码登录:', loginForm.value)
  }
  
  // 处理短信登录
  const handleSmsLogin = () => {
    console.log('短信登录:', smsForm.value)
  }
  
  // 处理注册
  const handleRegister = async () => {
    if (!registerFormRef.value) return
    
    try {
      await registerFormRef.value.validate()
      console.log('注册表单数据:', registerForm.value)
      // 这里添加注册逻辑
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }
  
  // 发送验证码
  const sendCode = () => {
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  }
  </script>
  
  <style scoped>
  .login-dialog :deep(.el-dialog__header) {
    display: none;
  }
  
  .login-dialog :deep(.el-dialog__body) {
    padding: 0;
  }
  
  .dialog-header {
    padding: 0 24px;
    border-bottom: 1px solid #f0f0f0;
    height: 40px;
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
  }
  
  .tabs {
    margin-left: auto;
    padding-right: 32px;
    display: flex;
    gap: 20px;
    height: 100%;
  }
  
  .tab-item {
    font-size: 16px;
    font-weight: 500;
    color: #666;
    cursor: pointer;
    height: 100%;
    display: flex;
    align-items: center;
    position: relative;
    padding: 0 4px;
  }
  
  .tab-item.active {
    color: #fb7299;
    font-weight: 600;
  }
  
  .tab-item.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #fb7299;
  }
  
  .close-btn {
    cursor: pointer;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 4px;
  }
  
  .close-btn:hover {
    color: #fb7299;
  }
  
  .dialog-content {
    display: flex;
    height: 520px;
    overflow: hidden;
  }
  
  .left-section {
    flex: 1;
    background-color: #f6f7f8;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  .left-section img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .right-section {
    flex: 1;
    padding: 32px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  
  .login-form,
  .register-form {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .other-login {
    margin-top: auto;
    padding-top: 32px;
  }
  
  .divider {
    position: relative;
    margin: 24px 0;
    text-align: center;
  }
  
  .divider::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: 1px;
    background-color: #eee;
  }
  
  .divider span {
    position: relative;
    background-color: #fff;
    padding: 0 12px;
    color: #999;
    font-size: 14px;
    font-weight: 500;
  }
  
  .login-icons {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-top: 24px;
  }
  
  .login-icons .icon {
    font-size: 24px;
    color: #666;
    cursor: pointer;
  }
  
  .login-icons .icon:hover {
    color: #fb7299;
  }
  
  .register-tip,
  .login-tip {
    text-align: center;
    margin-top: 16px;
    padding-bottom: 16px;
  }
  
  .register-link,
  .login-link {
    color: #00aeec;
    cursor: pointer;
    font-weight: 600;
  }
  
  .register-link:hover,
  .login-link:hover {
    color: #fb7299;
  }
  
  :deep(.el-input__wrapper) {
    padding-left: 8px;
  }
  
  :deep(.el-input__prefix) {
    margin-right: 8px;
  }
  
  :deep(.el-input__wrapper input) {
    font-size: 15px;
    font-weight: 500;
  }
  
  :deep(.el-input__wrapper input::placeholder) {
    font-size: 15px;
    font-weight: normal;
  }
  
  :deep(.el-checkbox__label) {
    font-size: 15px;
    font-weight: 500;
  }
  
  .login-form :deep(.el-form-item),
  .register-form :deep(.el-form-item) {
    margin-bottom: 20px;
  }
  
  .login-form :deep(.el-input__wrapper) {
    padding: 4px 12px;
    height: 48px;
    box-shadow: 0 0 0 1px #dcdfe6;
  }
  
  .login-form :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #fb7299;
  }
  
  .login-form :deep(.el-input__inner) {
    font-size: 16px;
    height: 100%;
  }
  
  .login-form :deep(.el-input__prefix) {
    margin-right: 12px;
  }
  
  .login-form :deep(.el-input__prefix-inner svg) {
    width: 18px;
    height: 18px;
    color: #909399;
  }
  
  .form-options {
    margin: 24px 0 32px;
  }
  
  .submit-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .login-form :deep(.el-input__wrapper input::placeholder) {
    font-size: 16px;
    color: #909399;
  }
  
  .login-form :deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px #fb7299;
  }
  
  .login-form :deep(.el-input__wrapper input) {
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
  
  /* 注册表单样式 */
  .register-form {
    margin-top: 32px;
  }
  
  .register-form :deep(.el-form-item) {
    margin-bottom: 24px;
  }
  
  .register-form :deep(.el-input__wrapper) {
    padding: 4px 12px;
    height: 48px;
    box-shadow: 0 0 0 1px #dcdfe6;
  }
  
  .register-form :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #fb7299;
  }
  
  .register-form :deep(.el-input__inner) {
    font-size: 16px;
    height: 100%;
  }
  
  .register-form :deep(.el-input__prefix) {
    margin-right: 12px;
  }
  
  .register-form :deep(.el-input__prefix-inner svg) {
    width: 18px;
    height: 18px;
    color: #909399;
  }
  
  .register-form :deep(.el-input__wrapper input) {
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
  
  .register-form :deep(.el-input__wrapper input::placeholder) {
    font-size: 16px;
    color: #909399;
  }
  
  .register-form :deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px #fb7299;
  }
  
  .login-tip {
    text-align: center;
    margin-top: 16px;
    font-size: 15px;
    color: #666;
    font-weight: 500;
  }
  
  .login-link {
    color: #00aeec;
    cursor: pointer;
    font-weight: 600;
  }
  
  .login-link:hover {
    color: #fb7299;
  }
  </style>