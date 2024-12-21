import eventBus from '@/utils/eventBus'

class WebSocketClient {
  constructor(url, username) {
    this.url = `${url}?username=${username}`
    this.ws = null
    this.isConnected = false
    this.messageCallbacks = []
  }

  // 连接WebSocket
  connect() {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log('WebSocket连接成功')
      this.isConnected = true
      this.reconnectAttempts = 0
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
            .forEach(msg => {
              this.messageCallbacks.forEach(callback => callback(msg))
            })
        } else {
          // 处理单条消息
          this.messageCallbacks.forEach(callback => callback(messages))
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
}

export default WebSocketClient 