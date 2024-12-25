import axios from "axios";

//热门番剧
export const getHotService = () => {
    return axios.get('https://api.jikan.moe/v4/top/anime?limit=20')
}