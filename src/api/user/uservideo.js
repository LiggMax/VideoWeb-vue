import request from "@/utils/request";

//获取视频点赞、收藏、投币状态
export const getVideoLikeService = (videoId,action) => {
  return request.get(`/user/video/${videoId}/doAction?action=${action}`);
};

//点赞、收藏、投币
export const userActionService = (videoId, action) => {
  return request.put(`/user/video/${videoId}/doAction?action=${action}`);
};