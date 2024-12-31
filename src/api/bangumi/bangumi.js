import axios from "axios";

//热门番剧
export const getHotService = () => {
    return axios.get('https://api.jikan.moe/v4/top/anime?limit=25')
}
//番剧时间表
export const getBangumiService = () => {
    return axios.get('https://api.bgm.tv/calendar')
}