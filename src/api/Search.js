import request from "@/utils/request"

// 搜索
export const getSearchResult = (params) => {
    return request.get('/search', {
        params: {
            keyword: params.keyword,
            pageNum: params.pageNum,
            pageSize: params.pageSize
        }
    })
}