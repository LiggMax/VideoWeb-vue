import axios from "axios";
export const getHotService = () => {
    return axios.get('https://api.jikan.moe/v4/top/anime?limit=12')
}