import request from "@/utils/request";

//获取视频点赞状态
export const getVideoLikeService = (videoId) => {
  return request.get(`/user/video/like?videoId=${videoId}`);
};

//点赞、收藏、投币
export const userLikeService = (videoId, action) => {
  return request.put(`/user/video/${videoId}/doAction?action=${action}`);
};