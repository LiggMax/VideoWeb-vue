import eventBus from '@/utils/eventBus'

class WebSocketClient {
  static instance = null;
  
  constructor(url, username) {
    if (WebSocketClient.instance) {
      return WebSocketClient.instance;
    }
    
    this.url = `${url}?username=${username}`
    this.ws = null
    this.isConnected = false
    this.messageCallbacks = []
    this.statusCallbacks = []
    this.openCallbacks = []
    
    WebSocketClient.instance = this;
  }

  // 连接WebSocket
  connect() {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log('WebSocket连接成功')
      this.isConnected = true
      this.reconnectAttempts = 0
      this.openCallbacks.forEach(callback => callback())
    }

    this.ws.onmessage = (event) => {
      try {
        const messages = JSON.parse(event.data)
        // 处理批量消息的情况
        if (Array.isArray(messages)) {
          console.log('收到离线消息批量:', messages.length)
          // 按时间顺序处理离线消息
          messages
            .sort((a, b) => new Date(a.data.time) - new Date(b.data.time))
            .forEach(msg => this.handleMessage(msg))
        } else {
          // 处理单条消息
          this.handleMessage(messages)
        }
      } catch (error) {
        console.error('解析消息失败:', error)
      }
      eventBus.emit('newMessage')
    }

    this.ws.onclose = () => {
      console.log('WebSocket连接关闭')
      this.isConnected = false
      // 尝试重新连接
      setTimeout(() => {
        this.connect()
      }, 3000)
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket错误:', error)
      this.isConnected = false
    }
  }

  // 发送消息
  sendMessage(message) {
    if (this.isConnected) {
      console.log('WebSocket sending:', message)
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('WebSocket not connected')
    }
  }

  // 添加消息监听器
  onMessage(callback) {
    this.messageCallbacks.push(callback)
  }

  // 关闭连接
  close() {
    if (this.ws) {
      this.ws.close()
    }
  }

  // 添加状态监听器
  onStatus(callback) {
    this.statusCallbacks.push(callback)
  }

  // 处理消息
  handleMessage(message) {
    if (message.type === 'status') {
      // 处理状态消息
      this.statusCallbacks.forEach(callback => callback(message))
    } else {
      // 处理聊天消息
      this.messageCallbacks.forEach(callback => callback(message))
    }
  }

  // 添加连接成功的监听器
  onOpen(callback) {
    this.openCallbacks.push(callback)
    if (this.isConnected) {
      callback()
    }
  }

  // 清除实例时也清除所有回调
  static clearInstance() {
    if (WebSocketClient.instance) {
      WebSocketClient.instance.messageCallbacks = []
      WebSocketClient.instance.statusCallbacks = []
      WebSocketClient.instance.openCallbacks = []
      WebSocketClient.instance.close()
      WebSocketClient.instance = null
    }
  }
}

export default WebSocketClient 