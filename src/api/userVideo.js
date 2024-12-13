//导入request.js请求工具
import request from "@/utils/request";

//发布视频接口
export const publishVideoService = (videoData) => {
    return request.post('/user/video', videoData)
}
//获取用户视频接口
export const getUserVideoService = () => {
    return request.get('/user/video')
}
//编辑视频接口
export const editVideoService = (videoData) => {
    return request.put('/user/video', videoData)
}