import request from "@/utils/request"

//获取轮播图数据
export const getBannerService = () => {
  return request.get('/anime/Carousel')
}
