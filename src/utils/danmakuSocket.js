class DanmakuSocket {
  constructor(videoId) {
    this.videoId = videoId
    this.ws = null
    this.isConnected = false
    this.messageCallbacks = []
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  connect() {
    // 连接到WebSocket服务器
    this.ws = new WebSocket(`ws://your-domain/danmaku/${this.videoId}`)

    this.ws.onopen = () => {
      console.log('弹幕服务连接成功')
      this.isConnected = true
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        // 触发所有注册的回调
        this.messageCallbacks.forEach(callback => callback(data))
      } catch (error) {
        console.error('解析弹幕数据失败:', error)
      }
    }

    this.ws.onclose = () => {
      this.isConnected = false
      this.reconnect()
    }

    this.ws.onerror = (error) => {
      console.error('弹幕服务连接错误:', error)
      this.isConnected = false
    }
  }

  // 重连机制
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('弹幕服务重连失败')
      return
    }

    setTimeout(() => {
      this.reconnectAttempts++
      console.log(`尝试重连弹幕服务 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      this.connect()
    }, 1000 * Math.min(this.reconnectAttempts, 5))
  }

  // 发送弹幕
  send(data) {
    if (!this.isConnected) {
      throw new Error('弹幕服务未连接')
    }
    this.ws.send(JSON.stringify(data))
  }

  // 注册消息处理回调
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

export default DanmakuSocket 