//导入request.js请求工具
import request from "@/utils/request";
import {useTokenStore} from "@/stores/token";
//注册接口
export const userRegisterService = (registerData) => {
    //借助于UrlSearchParams将数据转换为url参数，完成传递
    const params = new URLSearchParams()
    for (let key in registerData) {
        params.append(key, registerData[key]);
    }
    return request.post('/user/register', params);
}
//登录接口
export const userLoginService = (loginData) => {
    //借助于UrlSearchParams将数据转换为url参数，完成传递
    const params = new URLSearchParams()
    for (let key in loginData) {
        params.append(key, loginData[key]);
    }
    return request.post('/user/login', params);
}
//获取用户信息接口函数
export const getUserInfoService = ()=>{
    // const tokenStore = useTokenStore()
    return request.get('/user/userInfo'/*,{headers:{Authorization:tokenStore.token}}*/)
}
// 发送注册邮箱验证码
export const sendEmailCodeService = (email) => {
    return request.post('/email?email='+ email )
}
//发送重置密码邮箱验证码
export const sendResetEmailCodeService = (email) => {
    return request.post('/email/forget?email='+ email )
}
//重置密码
export const resetPasswordService = (resetData) => {
    const params = new URLSearchParams()
    for (let key in resetData) {
        params.append(key, resetData[key]);
    }
    return request.post('/user/resetPassword', params)
}