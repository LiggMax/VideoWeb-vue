/**
 * 格式化数字
 * @param {number} count 需要格式化的数字
 * @returns {string} 格式化后的字符串
 */
export const formatCount = (count) => {
  if (!count && count !== 0) return '0'
  
  const num = Number(count)
  if (isNaN(num)) return '0'
  
  if (num < 10000) {
    return num.toString()
  } else if (num < 100000000) {
    return (num / 10000).toFixed(1) + '万'
  } else {
    return (num / 100000000).toFixed(1) + '亿'
  }
}

/**
 * 格式化视频时长
 * @param {number} duration 视频时长（秒）
 * @returns {string} 格式化后的时长字符串
 */
export const formatDuration = (duration) => {
  if (!duration && duration !== 0) return '00:00'
  
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * 格式化日期
 * @param {string|Date} date 日期
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const now = new Date()
  const diff = now - d
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diff / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diff / (1000 * 60))
      if (diffMinutes === 0) {
        return '刚刚'
      }
      return `${diffMinutes}分钟前`
    }
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
}
