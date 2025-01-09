import request from "@/utils/request";

//获取番局剧集
export const getAnimeEpisodeService = (animeId) => {
  return request.get(`/anime/episode/${animeId}`)
}