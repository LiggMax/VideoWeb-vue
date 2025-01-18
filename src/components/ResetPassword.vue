<template>
  <el-dialog
    v-model="dialogVisible"
    width="400px"
    :show-close="false"
    class="reset-dialog"
    @close="$emit('close')"
  >
    <!-- 对话框头部 -->
    <div class="dialog-header">
      <div class="header-content">
        <h3>找回密码</h3>
        <div class="close-btn" @click="closeDialog">
          <el-icon><Close/></el-icon>
        </div>
      </div>
    </div>

    <!-- 对话框内容 -->
    <div class="dialog-content">
      <p class="subtitle">通过邮箱验证找回密码</p>
      
      <el-form 
        :model="resetForm" 
        :rules="resetRules" 
        ref="resetFormRef" 
        label-width="0"
        class="reset-form"
      >
        <!-- 邮箱输入 -->
        <el-form-item prop="email">
          <el-input
            v-model="resetForm.email"
            placeholder="请输入注册邮箱"
            :prefix-icon="Message"
          />
        </el-form-item>

        <!-- 验证码 -->
        <el-form-item prop="code">
          <div class="code-input-group">
            <el-input
              v-model="resetForm.code"
              placeholder="请输入验证码"
              :prefix-icon="Key"
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

        <!-- 新密码 -->
        <el-form-item prop="newPassword">
          <el-input
            v-model="resetForm.password"
            type="password"
            placeholder="请输入新密码"
            :prefix-icon="Lock"
          />
        </el-form-item>

        <!-- 确认新密码 -->
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="resetForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            :prefix-icon="Lock"
          />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-button type="primary" class="submit-btn" @click="handleReset">
          重置密码
        </el-button>

        <!-- 返回登录 -->
        <div class="back-login">
          <span class="back-link" @click="$emit('switch-to-login')">返回登录</span>
        </div>
      </el-form>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Message, Lock, Key, Close } from '@element-plus/icons-vue'
import {ElMessage} from "element-plus";
import {resetPasswordService, sendResetEmailCodeService} from "@/api/user/user";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'switch-to-login', 'close'])

const dialogVisible = ref(props.visible)

watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
})

watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
})

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false
}

// 表单数据
const resetForm = ref({
  email: '',
  code: '',
  password: '',
  confirmPassword: ''
})

// 表单验证规则
const resetRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (!/^\d+$/.test(value)) {
          callback(new Error('验证码只能包含数字'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度在 6 到 16 个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,16}$/.test(value)) {
          callback(new Error('密码必须包含字母和数字'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== resetForm.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else if (!value) {
          callback(new Error('请确认密码'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 验证码倒计时相关
const countdown = ref(0)
const isCountdown = computed(() => countdown.value > 0)
const countdownText = computed(() => isCountdown.value ? `${countdown.value}秒后重新发送` : '发送验证码')

// 发送验证码
const sendEmailCode = async () => {
  // 验证邮箱格式
  const emailRef = resetFormRef.value?.validateField('email')
  if (emailRef) {
    try {
      await emailRef
    } catch (error) {
      return
    }
  }

  try {
    isLoading.value = true
    await sendResetEmailCodeService(resetForm.value.email)
    ElMessage.success('验证码已发送，请注意查收')
    
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

// 重置密码
const handleReset = async () => {
  if (!resetFormRef.value) return
  
  try {
    await resetFormRef.value.validate()
    await resetPasswordService(resetForm.value)
    ElMessage.success('密码重置成功，请返回登录页')
    resetForm.value = {}
    closeDialog()
  } catch (error) {
    // 表单验证失败的错误会在表单中显示，不需要额外处理
  }
}

const resetFormRef = ref(null)

// 添加加载状态
const isLoading = ref(false)
</script>

<style scoped>
.reset-dialog :deep(.el-dialog__header) {
  display: none;
}

.reset-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.dialog-header {
  padding: 20px 20px 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h3 {
  font-size: 20px;
  color: #18191c;
  margin: 0;
}

.close-btn {
  cursor: pointer;
  padding: 4px;
  color: #909399;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #fb7299;
}

.dialog-content {
  padding: 20px;
}

.subtitle {
  font-size: 14px;
  color: #61666d;
  margin: 0 0 24px;
  text-align: center;
}

.reset-form :deep(.el-input__wrapper) {
  padding: 1px 12px;
  height: 40px;
  box-shadow: 0 0 0 1px #dcdfe6;
  display: flex;
  align-items: center;
}

.reset-form :deep(.el-input__inner) {
  height: 38px;
  line-height: 38px;
  font-size: 14px;
}

.reset-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.code-input-group {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.code-input-group :deep(.el-input) {
  flex: 1;
}

.send-code-btn {
  width: 120px;
  font-size: 14px;
  height: 40px;
  padding: 0 12px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-code-btn:not(:disabled) {
  background-color: #fb7299;
  border-color: #fb7299;
}

.send-code-btn:not(:disabled):hover {
  background-color: #fc8bab;
  border-color: #fc8bab;
}

.submit-btn {
  width: 100%;
  margin-top: 20px;
  height: 40px;
  background-color: #fb7299;
  border-color: #fb7299;
}

.submit-btn:hover {
  background-color: #fc8bab;
  border-color: #fc8bab;
}

.back-login {
  text-align: center;
  margin-top: 16px;
}

.back-link {
  color: #00aeec;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.3s;
}

.back-link:hover {
  color: #fb7299;
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
</style> 