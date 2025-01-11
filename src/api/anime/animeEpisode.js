import request from "@/utils/request";

// 获取番剧详情
export const getAnimeDetailService = (animeId) => {
  return request.get(`/anime/episode/${animeId}`)
}
//添加番剧剧集
export const addAnimeEpisodeService = (animeId,episodeData) => {
  return request.post(`/anime/episode/${animeId}`, episodeData)
}