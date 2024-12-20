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
    }

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      this.messageCallbacks.forEach(callback => callback(message))
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