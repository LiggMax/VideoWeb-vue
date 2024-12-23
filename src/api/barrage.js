import request from "@/utils/request"

//发送弹幕
export const sendBarrageService = (data) => {
  return request.post('/user/barrage',data)
}