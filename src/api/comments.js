import request from "@/utils/request"

// 添加评论接口
export const addCommentService = (id, content) => {
  return request.post('/comments/publish', {
    id,  // 视频id
    content   // 评论内容
  })
}
// 获取评论列表接口
export const getCommentsService = (id) => {
    return request.get('/comments?id='+id )
}