import request from "@/utils/request"

// 获取轮播图数据
export const getBannerService = () => {
  return request.get('/Carousel')
}

// 获取番剧列表
export const getAnimeListService = (params) => {
  return request.get('/anime', { params })
}

// 新增番剧
export const addAnimeService = (animeData) => {
  return request.post('/anime', animeData)
}

// 更新番剧
export const updateAnimeService = (id, animeData) => {
  return request.put(`/anime/${id}`, animeData)
}

// 删除番剧
export const deleteAnimeService = (id) => {
  return request.delete(`/anime/${id}`)
}

// 获取番剧详情
export const getAnimeDetailService = (id) => {
  return request.get(`/anime/${id}`)
}

// 添加剧集
export const addEpisodeService = (animeId, episodeData) => {
  return request.post(`/anime/${animeId}/episodes`, episodeData)
}

// 更新剧集
export const updateEpisodeService = (animeId, episodeId, episodeData) => {
  return request.put(`/anime/${animeId}/episodes/${episodeId}`, episodeData)
}

// 删除剧集
export const deleteEpisodeService = (animeId, episodeId) => {
  return request.delete(`/anime/${animeId}/episodes/${episodeId}`)
}

// 上传视频
export const uploadVideoService = (formData) => {
  return request.post('/file/uploadVideo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}