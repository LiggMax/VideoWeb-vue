import request from "@/utils/request"

//获取视频列表接口
export const getVideoListService = () => {
    return request.get('/video')
}