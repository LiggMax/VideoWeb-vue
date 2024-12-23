import request from "@/utils/request"

//发送弹幕
export const sendBarrageService = (data) => {
  return request.post('/user/barrage',data)
}
//获取弹幕
export const getBarrageService = (videoId) => {
  return request.get('/user/barrage?videoId='+videoId)
}