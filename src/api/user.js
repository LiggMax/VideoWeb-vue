//导入request.js请求工具
import request from "@/utils/request";

//注册接口
export const userRegisterService = (registerData) => {
    //借助于UrlSearchParams将数据转换为url参数，完成传递
    const params = new URLSearchParams()
    for (let key in registerData) {
        params.append(key, registerData[key]);
    }
    return request.post('/user/register', params);
}