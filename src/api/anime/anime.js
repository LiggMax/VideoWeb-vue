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

// 更新番剧  .
export const updateAnimeService = (animeId,animeData) => {
  return request.put(`/anime/${animeId}`, animeData)
}

// 删除番剧
export const deleteAnimeService = (id) => {
  return request.delete(`/anime/${id}`)
}

// 添加剧集
export const addEpisodeService = (animeId, episodeData) => {
  return request.post(`/anime/${animeId}/episodes`, episodeData)
}

// 上传视频
export const uploadVideoService = (formData) => {
  return request.post('/file/uploadVideo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
