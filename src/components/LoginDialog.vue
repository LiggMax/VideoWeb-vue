<template>
  <el-dialog
      v-model="dialogVisible"
      :width="isMobile ? '90%' : '800px'"
      :show-close="false"
      class="login-dialog"
      @close="handleDialogClose"
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
          <el-icon>
            <Close/>
          </el-icon>
        </div>
      </div>
    </div>

    <div class="dialog-content">
      <!-- 左侧图片 -->
      <div class="left-section" v-if="!isMobile">
        <img src="https://lain.bgm.tv/r/400/pic/cover/l/ba/69/277954_s8qHA.jpg" alt="login-banner"/>
      </div>

      <!-- 右侧登录表单 -->
      <div class="right-section">
        <!-- 密码登录表单 -->
        <div v-if="currentView === 'login'" class="login-form">
          <el-form :model="loginForm" @keyup.enter="handleLogin">
            <el-form-item>
              <el-input
                  v-model="loginForm.account"
                  placeholder="请输入账号/邮箱"
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
              <span class="forget-pwd" @click="handleForgetPassword">忘记密码？</span>
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
              <el-icon class="icon">
                <Position/>
              </el-icon>
              <el-icon class="icon">
                <ChatDotRound/>
              </el-icon>
              <el-icon class="icon">
                <Apple/>
              </el-icon>
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
            <!-- 添加邮箱输入框 -->
            <el-form-item prop="email">
              <el-input
                  v-model="registerForm.email"
                  placeholder="请输入邮箱"
                  :prefix-icon="Message"
                  size="large"
              />
            </el-form-item>

            <!-- 添加验证码输入框和发送按钮 -->
            <el-form-item prop="code">
              <div class="code-input-group">
                <el-input
                    v-model="registerForm.code"
                    placeholder="请输入验证码"
                    :prefix-icon="Key"
                    size="large"
                />
                <el-button
                    type="primary"
                    :disabled="isCountdown || isLoading"
                    @click="sendEmailCode"
                    class="send-code-btn"
                    :loading="isLoading"
                >
                  <span v-if="!isLoading">{{ countdownText }}</span>
                  <span v-else>发送中</span>
                </el-button>
              </div>
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

  <!-- 重置密码弹窗 - 移到登录弹窗外部 -->
  <reset-password
      v-if="showResetPassword"
      v-model:visible="showResetPassword"
      @switch-to-login="handleSwitchToLogin"
      @close="handleResetClose"
  />
</template>

<script setup>
import {ref, watch, computed, nextTick, onMounted, onUnmounted} from 'vue'
import {
  Close,
  Position,
  ChatDotRound,
  Apple,
  User,
  Lock,
  Iphone,
  Message,
  Key
} from '@element-plus/icons-vue'
import {sendEmailCodeService, userLoginService, userRegisterService} from "@/api/user/user";
import {ElMessage} from "element-plus";
import router from "@/router";
import {useTokenStore} from "@/stores/token";
import ResetPassword from './ResetPassword.vue'
import WebSocketClient from '@/utils/websocket'

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
const isCountdown = computed(() => countdown.value > 0)
const countdownText = computed(() => isCountdown.value ? `${countdown.value}秒后重新发送` : '发送验证码')

//引入tokenStore
const tokenStore = useTokenStore();

// 登录表单数据
const loginForm = ref({
  account: '',
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
  email: '',
  code: '',
  password: '',
  confirmPassword: ''
})

// 注册表单验证规则
const registerRules = {
  email: [
    {required: true, message: '请输入邮箱', trigger: 'blur'},
    {type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur'}
  ],
  code: [
    {required: true, message: '请输入验证码', trigger: 'blur'},
    {len: 6, message: '验证码长度为6位', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur'}
  ],
  confirmPassword: [
    {required: true, message: '请确认密码', trigger: 'blur'},
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
  if (!newVal) {
    showResetPassword.value = false
  }
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
      email: '',
      code: '',
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

// 处理账号登录
const handleLogin = async () => {
  if (!loginForm.value.account || !loginForm.value.password)
    return ElMessage.warning('请输入账号和密码')

  //判断是否符合5~15字符
  if (loginForm.value.account.length < 5 || loginForm.value.account.length > 20 ||
      loginForm.value.password.length < 5 || loginForm.value.password.length > 20) {
    return ElMessage.error('账号或密码长度在5-20个字符')
  }
  let result = await userLoginService(loginForm.value)

  // 把得到的token存储到pinia中
  tokenStore.setToken(result.data)

  // 创建 WebSocket 连接
  const ws = new WebSocketClient(
      'ws://127.0.0.1:8080/ws/chat',
      loginForm.value.username
  )
  ws.connect()

  ElMessage.success('登录成功')

  //关闭弹窗
  closeDialog()
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
    await registerFormRef.value.validate()
    let result = await userRegisterService(registerForm.value)
    tokenStore.setToken(result.data)
    ElMessage.success('注册成功')
    closeDialog()
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

// 添加加载状态
const isLoading = ref(false)

// 修改发送邮箱验证码方法
const sendEmailCode = async () => {
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerForm.value.email)) {
    return ElMessage.error('请输入正确的邮箱格式')
  }

  try {
    isLoading.value = true
    // 调用发送验证码接口
    await sendEmailCodeService(registerForm.value.email)
    ElMessage.success('验证码已发送，请注意查收')

    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } finally {
    isLoading.value = false
  }
}

// 添加状态控制
const showResetPassword = ref(false)

// 处理忘记密码点击
const handleForgetPassword = () => {
  dialogVisible.value = false
  // 使用 nextTick 确保在 DOM 更新后再显示重置密码弹窗
  nextTick(() => {
    showResetPassword.value = true
  })
}

// 处理返回登录
const handleSwitchToLogin = () => {
  showResetPassword.value = false
  nextTick(() => {
    dialogVisible.value = true
    currentView.value = 'login'
  })
}

const handleDialogClose = () => {
  showResetPassword.value = false
  emit('update:visible', false)
}

const handleResetClose = () => {
  showResetPassword.value = false
  emit('update:visible', false)
}

// 添加移动端检测
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
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
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* 修改注册表单样式 */
.register-form :deep(.el-input__wrapper) {
  padding: 1px 12px; /* 减小内边距 */
  height: 40px; /* 减小高度 */
  box-shadow: 0 0 0 1px #dcdfe6;
}

.register-form :deep(.el-input__inner) {
  font-size: 14px; /* 减小字体大小 */
  height: 100%;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 16px; /* 减小表单项间距 */
}

/* 调整验证码按钮样式 */
.send-code-btn {
  width: 120px;
  font-size: 14px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.send-code-btn:not(:disabled) {
  background-color: #fb7299;
  border-color: #fb7299;
}

.send-code-btn:not(:disabled):hover {
  background-color: #fc8bab;
  border-color: #fc8bab;
}

/* 加载动画样式 */
.send-code-btn :deep(.el-loading-spinner) {
  transform: scale(0.8);
}

.send-code-btn :deep(.el-loading-spinner .circular) {
  width: 20px;
  height: 20px;
}

.send-code-btn :deep(.el-loading-spinner .path) {
  stroke: #fff;
  stroke-width: 3;
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .login-dialog {
    background: #1a1a1a;
  }

  .dialog-header {
    border-bottom-color: #2c2c2c;
  }

  .tab-item {
    color: #e5e7eb;
  }

  .right-section {
    background: #1a1a1a;
  }

  :deep(.el-input__wrapper) {
    background: #2c2c2c;
    border-color: #3c3c3c;
  }

  :deep(.el-input__inner) {
    color: #e5e7eb;
  }

  :deep(.el-checkbox__label) {
    color: #e5e7eb;
  }

  .divider span {
    background: #1a1a1a;
    color: #e5e7eb;
  }

  .login-icons .icon {
    color: #e5e7eb;
  }

  .send-code-btn:not(:disabled) {
    background-color: #fb7299;
    border-color: #fb7299;
  }

  .send-code-btn :deep(.el-loading-spinner .path) {
    stroke: #fff;
  }
}

/* 添加移动端适配样式 */
@media screen and (max-width: 768px) {
  .dialog-content {
    height: auto;
    min-height: 400px;
  }

  .right-section {
    padding: 20px;
    width: 100%;
  }

  .tabs {
    padding-right: 16px;
    gap: 12px;
  }

  .tab-item {
    font-size: 14px;
  }

  .login-form :deep(.el-input__wrapper),
  .register-form :deep(.el-input__wrapper) {
    height: 40px;
  }

  .login-form :deep(.el-input__inner),
  .register-form :deep(.el-input__inner) {
    font-size: 14px;
  }

  .form-options {
    margin: 16px 0 24px;
  }

  .submit-btn {
    height: 40px;
    font-size: 14px;
  }

  .other-login {
    padding-top: 24px;
  }

  .login-icons {
    gap: 24px;
  }

  .login-icons .icon {
    font-size: 20px;
  }

  .register-tip,
  .login-tip {
    margin-top: 12px;
    padding-bottom: 12px;
    font-size: 13px;
  }

  .code-input-group {
    gap: 6px;
  }

  .send-code-btn {
    width: 100px;
    font-size: 12px;
  }

  :deep(.el-dialog) {
    margin: 10vh auto !important;
  }

  :deep(.el-dialog__body) {
    max-height: 80vh;
    overflow-y: auto;
  }

  .forget-pwd {
    font-size: 12px;
  }

  :deep(.el-checkbox__label) {
    font-size: 13px;
  }
}

.forget-pwd {
  color: #00aeec;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.3s;
}

.forget-pwd:hover {
  color: #fb7299;
}

/* 添加新样式 */
.code-input-group {
  display: flex;
  gap: 8px;
}

.code-input-group :deep(.el-input) {
  flex: 1;
}

.send-code-btn {
  width: 120px;
  font-size: 14px;
}

.send-code-btn:not(:disabled) {
  background-color: #fb7299;
  border-color: #fb7299;
}

.send-code-btn:not(:disabled):hover {
  background-color: #fc8bab;
  border-color: #fc8bab;
}

.forget-pwd {
  color: #00aeec;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.3s;
}

.forget-pwd:hover {
  color: #fb7299;
}

/* 添加移动端适配样式 */
@media screen and (max-width: 768px) {
  .dialog-content {
    height: auto;
    min-height: 400px;
  }

  .right-section {
    padding: 20px;
    width: 100%;
  }

  .tabs {
    padding-right: 16px;
    gap: 12px;
  }

  .tab-item {
    font-size: 14px;
  }

  .login-form :deep(.el-input__wrapper),
  .register-form :deep(.el-input__wrapper) {
    height: 40px;
  }

  .login-form :deep(.el-input__inner),
  .register-form :deep(.el-input__inner) {
    font-size: 14px;
  }

  .form-options {
    margin: 16px 0 24px;
  }

  .submit-btn {
    height: 40px;
    font-size: 14px;
  }

  .other-login {
    padding-top: 24px;
  }

  .login-icons {
    gap: 24px;
  }

  .login-icons .icon {
    font-size: 20px;
  }

  .register-tip,
  .login-tip {
    margin-top: 12px;
    padding-bottom: 12px;
    font-size: 13px;
  }

  .code-input-group {
    gap: 6px;
  }

  .send-code-btn {
    width: 100px;
    font-size: 12px;
  }

  :deep(.el-dialog) {
    margin: 10vh auto !important;
  }

  :deep(.el-dialog__body) {
    max-height: 80vh;
    overflow-y: auto;
  }

  .forget-pwd {
    font-size: 12px;
  }

  :deep(.el-checkbox__label) {
    font-size: 13px;
  }
}

/* 添加暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .login-dialog {
    background: #1a1a1a;
  }

  .dialog-header {
    border-bottom-color: #2c2c2c;
  }

  .tab-item {
    color: #e5e7eb;
  }

  .right-section {
    background: #1a1a1a;
  }

  :deep(.el-input__wrapper) {
    background: #2c2c2c;
    border-color: #3c3c3c;
  }

  :deep(.el-input__inner) {
    color: #e5e7eb;
  }

  :deep(.el-checkbox__label) {
    color: #e5e7eb;
  }

  .divider span {
    background: #1a1a1a;
    color: #e5e7eb;
  }

  .login-icons .icon {
    color: #e5e7eb;
  }
}
</style>