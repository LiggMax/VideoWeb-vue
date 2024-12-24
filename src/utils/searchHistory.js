const HISTORY_KEY = 'search_history'
const MAX_HISTORY = 10

export const getSearchHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
  } catch {
    return []
  }
}

export const addSearchHistory = (keyword) => {
  if (!keyword) return
  
  const history = getSearchHistory()
  // 移除已存在的相同关键词
  const filteredHistory = history.filter(item => item !== keyword)
  // 添加到开头
  filteredHistory.unshift(keyword)
  // 限制数量
  const newHistory = filteredHistory.slice(0, MAX_HISTORY)
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
  return newHistory
}

export const clearSearchHistory = () => {
  localStorage.removeItem(HISTORY_KEY)
} 