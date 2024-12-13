//导入request.js请求工具
import request from "@/utils/request";

//发布视频接口
export const publishVideoService = (videoData) => {
    return request.post('/user/addVideo', videoData)
}
//获取用户视频接口
export const getUserVideoService = () => {
    return request.get('/user/video')
}