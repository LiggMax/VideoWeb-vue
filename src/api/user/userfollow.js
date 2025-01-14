import request from '@/utils/request'

// 用户关注或取消关注接口
export const followUserService = (id, isFollow) => {
  return request.put(`/user/follow/${id}?isFollow=${isFollow}`)
}
// 获取用户关注信息接口
export const getUserFollowService = (id) => {
  return request.get(`/user/follow/${id}`)
}